import * as duckdb from "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.29.0/+esm";

const COMMON_DATE_FORMATS = ["%Y-%m-%d", "%m/%d/%Y", "%d-%m-%Y", "%d/%m/%Y", "%Y/%m/%d"];
const MAX_PREVIEW_ROWS = 200;

const state = {
  db: null,
  conn: null,
  inputFile: null,
  inputFileName: "",
  rawColumns: [],
  recipe: null,
  compiled: null,
  activeFilter: "all",
  previewPage: 1,
  previewPageSize: MAX_PREVIEW_ROWS,
  hasData: false,
  sanitizeStats: null,
  tableStats: { rows: 0, cols: 0, modified: 0, errors: 0, inputRows: 0, filteredRows: 0 }
};

const elements = {
  fileInput: document.getElementById("fileInput"),
  dropzone: document.getElementById("dropzone"),
  dropzoneText: document.getElementById("dropzoneText"),
  dropzoneLoader: document.getElementById("dropzoneLoader"),
  fileMeta: document.getElementById("fileMeta"),
  ingestSummary: document.getElementById("ingestSummary"),
  normalizationDetails: document.getElementById("normalizationDetails"),
  normPaddedRows: document.getElementById("normPaddedRows"),
  normMergedRows: document.getElementById("normMergedRows"),
  normDroppedRows: document.getElementById("normDroppedRows"),
  toggleTrimWhitespace: document.getElementById("toggleTrimWhitespace"),
  toggleDateNormalization: document.getElementById("toggleDateNormalization"),
  toggleDeduplicate: document.getElementById("toggleDeduplicate"),
  toggleDropEmptyRows: document.getElementById("toggleDropEmptyRows"),
  toggleDropErrorRows: document.getElementById("toggleDropErrorRows"),
  dedupeColumn: document.getElementById("dedupeColumn"),
  trimCount: document.getElementById("trimCount"),
  dateFixCount: document.getElementById("dateFixCount"),
  emptyRowCount: document.getElementById("emptyRowCount"),
  columnSchemaList: document.getElementById("columnSchemaList"),
  tableWrap: document.getElementById("tableWrap"),
  tableLoading: document.getElementById("tableLoading"),
  statsLine: document.getElementById("statsLine"),
  statsLoader: document.getElementById("statsLoader"),
  modifiedCount: document.getElementById("modifiedCount"),
  errorsCount: document.getElementById("errorsCount"),
  previewPageSize: document.getElementById("previewPageSize"),
  previewPrev: document.getElementById("previewPrev"),
  previewNext: document.getElementById("previewNext"),
  previewPageInfo: document.getElementById("previewPageInfo"),
  rowDeltaWarning: document.getElementById("rowDeltaWarning"),
  copyRecipe: document.getElementById("copyRecipe"),
  exportCsv: document.getElementById("exportCsv"),
  exportParquet: document.getElementById("exportParquet"),
  exportJson: document.getElementById("exportJson")
};

function quoteIdent(name) {
  return `"${String(name).replace(/"/g, "\"\"")}"`;
}

function quoteLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function snakeCase(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_{2,}/g, "_") || "column";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 ** 2)).toFixed(1)} MB`;
}

function setLoadingState(isLoading, statusText) {
  elements.dropzoneLoader.classList.toggle("hidden", !isLoading);
  elements.statsLoader.classList.toggle("hidden", !isLoading);
  elements.tableLoading.classList.toggle("hidden", !isLoading);
  if (statusText) {
    elements.fileMeta.textContent = statusText;
  }
}

function setControlsEnabled(enabled) {
  const targets = [
    elements.toggleTrimWhitespace,
    elements.toggleDateNormalization,
    elements.toggleDeduplicate,
    elements.toggleDropEmptyRows,
    elements.toggleDropErrorRows,
    elements.dedupeColumn,
    ...elements.columnSchemaList.querySelectorAll("input,select"),
    ...document.querySelectorAll(".tab"),
    elements.previewPageSize,
    elements.previewPrev,
    elements.previewNext,
    elements.copyRecipe,
    elements.exportCsv,
    elements.exportParquet,
    elements.exportJson
  ];
  targets.forEach((el) => {
    if (el) el.disabled = !enabled;
  });
}

function formatRowList(values) {
  if (!values || values.length === 0) return "none";
  return values.join(", ");
}

function updateNormalizationDetails(stats) {
  elements.normPaddedRows.textContent = formatRowList(stats?.paddedRowNumbers);
  elements.normMergedRows.textContent = formatRowList(stats?.mergedRowNumbers);
  elements.normDroppedRows.textContent = formatRowList(stats?.droppedRowNumbers);
  const issueCount = (stats?.paddedRows || 0) + (stats?.mergedRows || 0) + (stats?.droppedEmptyRows || 0);
  elements.normalizationDetails.open = issueCount > 0;
}

function resetDataState(reason = "Drop a CSV to begin.") {
  state.hasData = false;
  state.recipe = null;
  state.compiled = null;
  state.rawColumns = [];
  state.sanitizeStats = null;
  elements.statsLine.textContent = reason;
  elements.tableWrap.innerHTML = '<div class="empty-state">Preview will appear here.</div>';
  elements.previewPageInfo.textContent = "Page 1 / 1";
  elements.previewPrev.disabled = true;
  elements.previewNext.disabled = true;
  elements.modifiedCount.textContent = "0";
  elements.errorsCount.textContent = "0";
  elements.trimCount.textContent = "0";
  elements.emptyRowCount.textContent = "0";
  elements.dateFixCount.textContent = "0";
  elements.columnSchemaList.innerHTML = "";
  elements.dedupeColumn.innerHTML = "";
  elements.ingestSummary.textContent = "No data-quality checks yet.";
  elements.rowDeltaWarning.classList.add("hidden");
  updateNormalizationDetails({
    paddedRowNumbers: [],
    mergedRowNumbers: [],
    droppedRowNumbers: []
  });
  setControlsEnabled(false);
}

function parseCsvLine(line, delimiter) {
  const out = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === "\"") {
      if (inQuotes && line[i + 1] === "\"") {
        current += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === delimiter && !inQuotes) {
      out.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  out.push(current);
  const parsed = out.map((field) => field.trim());
  if (parsed.length === 1 && line.includes(delimiter)) {
    return line.split(delimiter).map((field) => field.trim());
  }
  return parsed;
}

function makeUniqueColumnNames(headers) {
  const used = new Map();
  return headers.map((header, idx) => {
    const base = snakeCase(header || `column_${idx + 1}`);
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    return count === 0 ? base : `${base}_${count + 1}`;
  });
}

function isLikelyDataToken(value) {
  const token = String(value ?? "").trim();
  if (!token) return false;
  if (/^[+-]?\d+(\.\d+)?$/.test(token)) return true;
  if (/^[+-]?\$?\d[\d,]*(\.\d+)?$/.test(token)) return true;
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(token)) return true;
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/.test(token)) return true;
  if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(token)) return true;
  if (/^(true|false|yes|no)$/i.test(token)) return true;
  return false;
}

function inferHasHeader(firstFields, secondFields) {
  if (!firstFields.length) return true;
  if (!secondFields.length || firstFields.length !== secondFields.length) return true;
  const firstDataRatio = firstFields.filter(isLikelyDataToken).length / firstFields.length;
  const secondDataRatio = secondFields.filter(isLikelyDataToken).length / secondFields.length;
  return !(firstDataRatio >= 0.6 && secondDataRatio >= 0.6);
}

async function sniffCsvConfig(file) {
  const chunk = await file.slice(0, 64 * 1024).text();
  const [firstLine = "", secondLine = ""] = chunk.split(/\r?\n/);
  const candidates = [",", ";", "\t", "|"];
  const winner = candidates
    .map((delimiter) => ({ delimiter, count: parseCsvLine(firstLine, delimiter).length }))
    .sort((a, b) => b.count - a.count)[0];
  const delimiter = winner?.count > 1 ? winner.delimiter : ",";
  const firstFields = parseCsvLine(firstLine, delimiter);
  const secondFields = parseCsvLine(secondLine, delimiter);
  const hasHeader = inferHasHeader(firstFields, secondFields);
  const inferredHeaders = hasHeader
    ? firstFields
    : Array.from({ length: firstFields.length }, (_, idx) => `column_${idx + 1}`);
  const headers = makeUniqueColumnNames(inferredHeaders);
  return { delimiter, headers, hasHeader };
}

function makeReadCsvFallbackSql(fileName, delimiter, headers) {
  const columnsMap = headers.map((h) => `${quoteLiteral(h)}: 'VARCHAR'`).join(", ");
  return `
    CREATE OR REPLACE TEMP VIEW raw_input AS
    SELECT ROW_NUMBER() OVER () AS __rowid, *
    FROM read_csv(
      ${quoteLiteral(fileName)},
      auto_detect=false,
      header=true,
      delim=${quoteLiteral(delimiter)},
      quote='"',
      escape='"',
      ignore_errors=true,
      null_padding=true,
      columns={${columnsMap}}
    );
  `;
}

function escapeCsvField(value, delimiter) {
  const raw = value == null ? "" : String(value);
  const escaped = raw.replace(/"/g, "\"\"");
  if (escaped.includes(delimiter) || escaped.includes("\"") || escaped.includes("\n") || escaped.includes("\r")) {
    return `"${escaped}"`;
  }
  return escaped;
}

async function sanitizeCsvText(file, csvConfig) {
  const text = await file.text();
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const [headerLine, ...remainingLines] = lines;
  const dataLines = csvConfig.hasHeader ? remainingLines : lines;
  const sourceHeaders = parseCsvLine(headerLine ?? "", csvConfig.delimiter);
  const headers = csvConfig.hasHeader
    ? makeUniqueColumnNames(sourceHeaders.length > 1 ? sourceHeaders : csvConfig.headers)
    : csvConfig.headers;
  const rows = [];
  let paddedRows = 0;
  let mergedRows = 0;
  let droppedEmptyRows = 0;
  const paddedRowNumbers = [];
  const mergedRowNumbers = [];
  const droppedRowNumbers = [];
  dataLines.forEach((line, idx) => {
    const sourceRowNumber = csvConfig.hasHeader ? idx + 2 : idx + 1;
    if (line.trim() === "") {
      if (idx === dataLines.length - 1) return;
      droppedEmptyRows += 1;
      droppedRowNumbers.push(sourceRowNumber);
      return;
    }
    const parsed = parseCsvLine(line, csvConfig.delimiter);
    let normalized = parsed;
    if (parsed.length < headers.length) {
      normalized = [...parsed, ...Array(headers.length - parsed.length).fill("")];
      paddedRows += 1;
      paddedRowNumbers.push(sourceRowNumber);
    } else if (parsed.length > headers.length) {
      normalized = [...parsed.slice(0, headers.length - 1), parsed.slice(headers.length - 1).join(csvConfig.delimiter)];
      mergedRows += 1;
      mergedRowNumbers.push(sourceRowNumber);
    }
    rows.push(normalized.map((cell) => escapeCsvField(cell, csvConfig.delimiter)).join(csvConfig.delimiter));
  });
  const csvText = `${headers.map((h) => escapeCsvField(h, csvConfig.delimiter)).join(csvConfig.delimiter)}\n${rows.join("\n")}\n`;
  return {
    csvText,
    headers,
    stats: {
      paddedRows,
      mergedRows,
      droppedEmptyRows,
      paddedRowNumbers,
      mergedRowNumbers,
      droppedRowNumbers,
      totalRows: rows.length,
      hasHeader: csvConfig.hasHeader
    }
  };
}

async function loadSanitizedRawInputView(fileName, delimiter, headers) {
  await state.conn.query(makeReadCsvFallbackSql(fileName, delimiter, headers));
  return (await state.conn.query("DESCRIBE raw_input"))
    .toArray()
    .map((r) => r.column_name)
    .filter((c) => c !== "__rowid");
}

async function ensureDuckDb() {
  if (state.conn) return;
  const logger = new duckdb.VoidLogger();
  const bundles = duckdb.getJsDelivrBundles();
  const bundle = bundles.mvp ?? bundles.eh;
  if (!bundle) {
    throw new Error("No compatible DuckDB-Wasm bundle found.");
  }
  const workerUrl = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker}");`], { type: "text/javascript" })
  );
  const worker = new Worker(workerUrl);
  const db = new duckdb.AsyncDuckDB(logger, worker);
  try {
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  } finally {
    URL.revokeObjectURL(workerUrl);
  }
  const conn = await db.connect();
  state.db = db;
  state.conn = conn;
}

function buildDefaultRecipe(columns) {
  const columnRules = columns.map((sourceName) => ({
    sourceName,
    targetName: snakeCase(sourceName),
    type: "string",
    transforms: [],
    inputFormats: [...COMMON_DATE_FORMATS],
    outputFormat: "%Y-%m-%d",
    stripChars: ["$", ","],
    onInvalid: "flag"
  }));
  const dedupeCandidate = columnRules.find((c) => c.targetName.includes("email")) ?? columnRules[0];
  return {
    recipeVersion: "1.0",
    source: {
      delimiter: "auto",
      encoding: "utf-8",
      skipRows: 0
    },
    globalRules: {
      trimWhitespace: true,
      dropEmptyRows: false,
      dropErrorRows: false,
      normalizeHeaders: "snake_case",
      deduplicate: {
        enabled: false,
        keyColumns: dedupeCandidate ? [dedupeCandidate.targetName] : [],
        keep: "last"
      }
    },
    columns: columnRules
  };
}

function applyUiToRecipe() {
  if (!state.recipe) return;
  state.recipe.globalRules.trimWhitespace = elements.toggleTrimWhitespace.checked;
  state.recipe.globalRules.dropEmptyRows = elements.toggleDropEmptyRows.checked;
  state.recipe.globalRules.dropErrorRows = elements.toggleDropErrorRows.checked;
  state.recipe.globalRules.deduplicate.enabled = elements.toggleDeduplicate.checked;
  for (const rowEl of elements.columnSchemaList.querySelectorAll("[data-source]")) {
    const sourceName = rowEl.dataset.source;
    const col = state.recipe.columns.find((c) => c.sourceName === sourceName);
    if (!col) continue;
    const targetInput = rowEl.querySelector("[data-field='target']");
    const typeSelect = rowEl.querySelector("[data-field='type']");
    col.targetName = snakeCase(targetInput.value || col.sourceName);
    col.type = typeSelect.value;
    if (col.type === "email" && !col.transforms.includes("lowercase")) {
      col.transforms = ["lowercase"];
    }
    if (col.type !== "email") {
      col.transforms = col.transforms.filter((t) => t !== "lowercase");
    }
    if (col.type !== "date") {
      col.inputFormats = [];
    } else if (col.inputFormats.length === 0) {
      col.inputFormats = [...COMMON_DATE_FORMATS];
    }
  }
  renderDedupeDropdown();
  state.recipe.globalRules.deduplicate.keyColumns = elements.dedupeColumn.value ? [elements.dedupeColumn.value] : [];
  if (!elements.toggleDateNormalization.checked) {
    for (const col of state.recipe.columns) {
      if (col.type === "date") col.type = "string";
    }
  }
}

function compileRecipe(recipe, tableName = "raw_input") {
  const selectClauses = ["r.__rowid"];
  const errorColumns = [];
  const normalizeStrings = recipe.globalRules.trimWhitespace;
  for (const col of recipe.columns) {
    const src = `${quoteIdent("r")}.${quoteIdent(col.sourceName)}`;
    let expr = src;
    if (normalizeStrings) expr = `TRIM(${expr})`;
    if (col.transforms?.includes("lowercase")) expr = `LOWER(${expr})`;
    let invalidExpr = "FALSE";
    if (col.type === "date") {
      const formats = col.inputFormats?.length ? col.inputFormats : COMMON_DATE_FORMATS;
      const parsers = formats.map((fmt) => `TRY_STRPTIME(${expr}, ${quoteLiteral(fmt)})`).join(", ");
      const parsedExpr = `COALESCE(${parsers})`;
      invalidExpr = `(NULLIF(${expr}, '') IS NOT NULL AND ${parsedExpr} IS NULL)`;
      expr = `CASE WHEN ${parsedExpr} IS NULL THEN NULL ELSE STRFTIME(${parsedExpr}, ${quoteLiteral(col.outputFormat || "%Y-%m-%d")}) END`;
    } else if (col.type === "decimal") {
      const escapedChars = (col.stripChars ?? [])
        .map((ch) => ch.replace(/[\\\]^]/g, "\\$&"))
        .join("");
      const stripRegex = `[${escapedChars}]`;
      const cleanedExpr = escapedChars ? `REGEXP_REPLACE(${expr}, ${quoteLiteral(stripRegex)}, '', 'g')` : expr;
      const castExpr = `TRY_CAST(${cleanedExpr} AS DOUBLE)`;
      invalidExpr = `(NULLIF(${expr}, '') IS NOT NULL AND ${castExpr} IS NULL)`;
      expr = castExpr;
    } else if (col.type === "email") {
      const emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
      invalidExpr = `(NULLIF(${expr}, '') IS NOT NULL AND NOT REGEXP_MATCHES(${expr}, ${quoteLiteral(emailRegex)}))`;
      expr = `CASE WHEN REGEXP_MATCHES(${expr}, ${quoteLiteral(emailRegex)}) THEN ${expr} ELSE NULL END`;
    }
    selectClauses.push(`${expr} AS ${quoteIdent(col.targetName)}`);
    const errCol = `__err_${snakeCase(col.targetName)}`;
    if (col.onInvalid === "flag") {
      selectClauses.push(`${invalidExpr} AS ${quoteIdent(errCol)}`);
      errorColumns.push(errCol);
    }
  }

  let sql = `SELECT\n  ${selectClauses.join(",\n  ")}\nFROM ${tableName} r`;
  if (recipe.globalRules.dropEmptyRows) {
    const nonEmptyChecks = recipe.columns
      .map((c) => `NULLIF(CAST(${quoteIdent(c.targetName)} AS VARCHAR), '') IS NOT NULL`)
      .join(" OR ");
    sql = `WITH base AS (${sql})\nSELECT * FROM base WHERE (${nonEmptyChecks})`;
  }
  if (recipe.globalRules.dropErrorRows && errorColumns.length > 0) {
    const errorChecks = errorColumns.map((c) => `COALESCE(${quoteIdent(c)}, FALSE)`).join(" OR ");
    sql = `WITH error_base AS (${sql})\nSELECT * FROM error_base WHERE NOT (${errorChecks})`;
  }
  if (recipe.globalRules.deduplicate?.enabled && recipe.globalRules.deduplicate.keyColumns?.length) {
    const keyExpr = recipe.globalRules.deduplicate.keyColumns.map(quoteIdent).join(", ");
    const order = recipe.globalRules.deduplicate.keep === "first" ? "ASC" : "DESC";
    sql = `WITH dedupe_base AS (${sql})\nSELECT * FROM dedupe_base\nQUALIFY ROW_NUMBER() OVER (PARTITION BY ${keyExpr} ORDER BY __rowid ${order}) = 1`;
  }
  return {
    sql,
    outputColumns: recipe.columns.map((c) => c.targetName),
    sourceColumns: recipe.columns.map((c) => c.sourceName),
    errorColumns
  };
}

function buildModifiedExpr(compiled) {
  if (!compiled?.outputColumns?.length) return "FALSE";
  return compiled.outputColumns
    .map((target, idx) => {
      const source = compiled.sourceColumns[idx];
      return `COALESCE(CAST(c.${quoteIdent(target)} AS VARCHAR), '') <> COALESCE(CAST(r.${quoteIdent(source)} AS VARCHAR), '')`;
    })
    .join(" OR ") || "FALSE";
}

function buildErrorExpr(compiled) {
  if (!compiled?.errorColumns?.length) return "FALSE";
  return compiled.errorColumns.map((c) => `COALESCE(c.${quoteIdent(c)}, FALSE)`).join(" OR ") || "FALSE";
}

function getActiveFilterWhereClause() {
  if (state.activeFilter === "modified") return "WHERE __is_modified";
  if (state.activeFilter === "errors") return "WHERE __has_error";
  return "";
}

function renderSchemaEditor() {
  elements.columnSchemaList.innerHTML = "";
  for (const col of state.recipe.columns) {
    const row = document.createElement("div");
    row.className = "schema-row";
    row.dataset.source = col.sourceName;
    row.innerHTML = `
      <div class="schema-source">${escapeHtml(col.sourceName)}</div>
      <div class="schema-grid">
        <input data-field="target" type="text" value="${escapeHtml(col.targetName)}">
        <select data-field="type">
          <option value="string"${col.type === "string" ? " selected" : ""}>String</option>
          <option value="email"${col.type === "email" ? " selected" : ""}>Email</option>
          <option value="date"${col.type === "date" ? " selected" : ""}>Date</option>
          <option value="decimal"${col.type === "decimal" ? " selected" : ""}>Float</option>
        </select>
      </div>
      <div class="schema-hint">${escapeHtml(col.autoDetectedHint || "Auto-detected: String · Low confidence (default fallback)")}</div>
    `;
    row.querySelectorAll("input,select").forEach((el) => {
      el.addEventListener("change", scheduleRecompute);
    });
    elements.columnSchemaList.appendChild(row);
  }
}

function renderDedupeDropdown() {
  elements.dedupeColumn.innerHTML = "";
  for (const col of state.recipe.columns) {
    const option = document.createElement("option");
    option.value = col.targetName;
    option.textContent = col.targetName;
    elements.dedupeColumn.appendChild(option);
  }
  const selected = state.recipe.globalRules.deduplicate.keyColumns[0];
  if (selected) elements.dedupeColumn.value = selected;
}

async function handleFile(file) {
  setLoadingState(true, "Preparing and parsing CSV...");
  setControlsEnabled(false);
  try {
    elements.fileMeta.textContent = "Initializing DuckDB...";
    await ensureDuckDb();
    state.inputFile = file;
    const csvConfig = await sniffCsvConfig(file);
    const { csvText, headers, stats } = await sanitizeCsvText(file, csvConfig);
    state.sanitizeStats = stats;
    state.inputFileName = `sanitized_${Date.now()}.csv`;
    await state.db.registerFileText(state.inputFileName, csvText);
    state.rawColumns = await loadSanitizedRawInputView(state.inputFileName, csvConfig.delimiter, headers);
    state.recipe = buildDefaultRecipe(state.rawColumns);
    renderSchemaEditor();
    renderDedupeDropdown();
    elements.dropzoneText.textContent = file.name;
    elements.fileMeta.textContent = `${file.name} • ${formatBytes(file.size)}`;
    const issueCount = stats.paddedRows + stats.mergedRows + stats.droppedEmptyRows;
    const headerNote = stats.hasHeader ? "header detected." : "no header detected; generated column names.";
    elements.ingestSummary.textContent = issueCount > 0
      ? `Input normalization: ${stats.paddedRows} short rows padded, ${stats.mergedRows} long rows merged, ${stats.droppedEmptyRows} blank rows dropped; ${headerNote}`
      : `Input normalization: no structural row issues detected; ${headerNote}`;
    updateNormalizationDetails(stats);
    await detectAndApplyAutoFixes();
    await recompute();
    state.hasData = true;
    setControlsEnabled(true);
  } catch (error) {
    elements.fileMeta.textContent = `Failed to load file: ${error.message}`;
    resetDataState("Failed to load CSV. Please try another file.");
  } finally {
    setLoadingState(false);
  }
}

async function detectAndApplyAutoFixes() {
  if (!state.rawColumns.length) return;
  const whitespaceChecks = state.rawColumns
    .map((c) => `SUM(CASE WHEN NULLIF(${quoteIdent(c)}, '') IS NOT NULL AND ${quoteIdent(c)} <> TRIM(${quoteIdent(c)}) THEN 1 ELSE 0 END)`)
    .join(" + ");
  const emptyChecks = state.rawColumns
    .map((c) => `NULLIF(TRIM(${quoteIdent(c)}), '') IS NOT NULL`)
    .join(" OR ");
  const dateChecks = state.rawColumns
    .map((c) => {
      const parsers = COMMON_DATE_FORMATS
        .map((fmt) => `TRY_STRPTIME(TRIM(${quoteIdent(c)}), ${quoteLiteral(fmt)})`)
        .join(", ");
      return `SUM(CASE WHEN NULLIF(TRIM(${quoteIdent(c)}), '') IS NOT NULL AND COALESCE(${parsers}) IS NOT NULL AND NOT REGEXP_MATCHES(TRIM(${quoteIdent(c)}), '^\\\\d{4}-\\\\d{2}-\\\\d{2}$') THEN 1 ELSE 0 END)`;
    })
    .join(" + ");
  const profileSql = `
    SELECT
      COALESCE(${whitespaceChecks}, 0) AS whitespace_count,
      SUM(CASE WHEN NOT (${emptyChecks}) THEN 1 ELSE 0 END) AS empty_rows_count,
      COALESCE(${dateChecks}, 0) AS date_fix_count
    FROM raw_input;
  `;
  const profile = (await state.conn.query(profileSql)).toArray()[0];
  elements.trimCount.textContent = Number(profile.whitespace_count || 0).toLocaleString();
  elements.emptyRowCount.textContent = Number(profile.empty_rows_count || 0).toLocaleString();
  elements.dateFixCount.textContent = Number(profile.date_fix_count || 0).toLocaleString();
  elements.toggleTrimWhitespace.checked = Number(profile.whitespace_count || 0) > 0;
  elements.toggleDropEmptyRows.checked = Number(profile.empty_rows_count || 0) > 0;
  elements.toggleDateNormalization.checked = Number(profile.date_fix_count || 0) > 0;

  let dedupeTarget = null;
  for (const col of state.recipe.columns) {
    const lower = col.sourceName.toLowerCase();
    if (lower.includes("email")) {
      col.type = "email";
      col.transforms = ["lowercase"];
      col.targetName = "email";
      col.autoDetectedHint = "Auto-detected: Email · High confidence (header keyword match)";
      dedupeTarget = "email";
    } else if (lower.includes("date") || lower.startsWith("dt_")) {
      col.type = elements.toggleDateNormalization.checked ? "date" : "string";
      col.autoDetectedHint = "Auto-detected: Date · Medium confidence (header keyword match)";
    } else if (lower.includes("amount") || lower.includes("total") || lower.includes("amt") || lower.includes("price")) {
      col.type = "decimal";
      col.autoDetectedHint = "Auto-detected: Float · Medium confidence (header keyword match)";
    } else {
      col.type = "string";
      col.autoDetectedHint = "Auto-detected: String · Low confidence (default fallback)";
    }
  }
  if (dedupeTarget) {
    state.recipe.globalRules.deduplicate.keyColumns = [dedupeTarget];
  }
  state.recipe.globalRules.deduplicate.enabled = false;
  elements.toggleDeduplicate.checked = false;
  renderSchemaEditor();
  renderDedupeDropdown();
}

async function recompute() {
  if (!state.recipe || !state.conn) return;
  setLoadingState(true);
  try {
    state.previewPage = 1;
    applyUiToRecipe();
    state.compiled = compileRecipe(state.recipe);
    await state.conn.query(`CREATE OR REPLACE TEMP VIEW cleaned_view AS ${state.compiled.sql};`);
    await refreshStats();
    await renderPreview();
  } catch (error) {
    state.compiled = null;
    elements.statsLine.textContent = "Recipe failed to compile. Check column mappings and data types.";
    elements.tableWrap.innerHTML = `<div class="empty-state">Failed to compute recipe: ${error.message}</div>`;
  } finally {
    setLoadingState(false);
  }
}

async function refreshStats() {
  if (!state.compiled) return;
  const inputRowsQuery = await state.conn.query("SELECT COUNT(*) AS input_rows FROM raw_input");
  const inputRows = Number(inputRowsQuery.toArray()[0]?.input_rows || 0);
  const modifiedExpr = buildModifiedExpr(state.compiled);
  const errorExpr = buildErrorExpr(state.compiled);
  const statsSql = `
    WITH annotated AS (
      SELECT
        c.*,
        (${modifiedExpr}) AS __is_modified,
        (${errorExpr}) AS __has_error
      FROM cleaned_view c
      LEFT JOIN raw_input r ON c.__rowid = r.__rowid
    )
    SELECT
      COUNT(*) AS total_rows,
      SUM(CASE WHEN __is_modified THEN 1 ELSE 0 END) AS modified_rows,
      SUM(CASE WHEN __has_error THEN 1 ELSE 0 END) AS error_rows
    FROM annotated;
  `;
  const stats = (await state.conn.query(statsSql)).toArray()[0];
  state.tableStats.rows = Number(stats.total_rows || 0);
  state.tableStats.modified = Number(stats.modified_rows || 0);
  state.tableStats.errors = Number(stats.error_rows || 0);
  state.tableStats.cols = state.compiled.outputColumns.length;
  state.tableStats.inputRows = inputRows;
  elements.modifiedCount.textContent = state.tableStats.modified.toLocaleString();
  elements.errorsCount.textContent = state.tableStats.errors.toLocaleString();
  elements.statsLine.textContent = `${state.tableStats.inputRows.toLocaleString()} input rows • ${state.tableStats.rows.toLocaleString()} output rows • ${state.tableStats.cols} cols • ${state.tableStats.modified.toLocaleString()} fixed`;
  if (state.tableStats.inputRows !== state.tableStats.rows) {
    const delta = state.tableStats.rows - state.tableStats.inputRows;
    const deltaText = delta > 0 ? `+${delta.toLocaleString()}` : delta.toLocaleString();
    const reductionReasons = [];
    if (state.recipe?.globalRules?.deduplicate?.enabled) reductionReasons.push("deduplication");
    if (state.recipe?.globalRules?.dropEmptyRows) reductionReasons.push("drop-empty rows");
    if (state.recipe?.globalRules?.dropErrorRows) reductionReasons.push("drop-error rows");
    const absoluteDelta = Math.abs(delta).toLocaleString();
    let reasonText = "";
    if (reductionReasons.length === 1) {
      const actionWord = delta < 0 ? "Dropped" : "Changed";
      reasonText = ` ${actionWord} ${absoluteDelta} rows due to ${reductionReasons[0]}.`;
    } else if (reductionReasons.length > 1) {
      reasonText = ` Contributors: ${reductionReasons.join(", ")}.`;
    }
    elements.rowDeltaWarning.textContent = `Material row change detected: ${deltaText} rows (${state.tableStats.inputRows.toLocaleString()} → ${state.tableStats.rows.toLocaleString()}).${reasonText}`;
    elements.rowDeltaWarning.classList.remove("hidden");
  } else {
    elements.rowDeltaWarning.classList.add("hidden");
  }
}

async function renderPreview() {
  if (!state.compiled) {
    elements.tableWrap.innerHTML = '<div class="empty-state">Load a CSV and apply a valid recipe to render preview.</div>';
    elements.previewPageInfo.textContent = "Page 1 / 1";
    elements.previewPrev.disabled = true;
    elements.previewNext.disabled = true;
    return;
  }
  const modifiedExpr = buildModifiedExpr(state.compiled);
  const errorExpr = buildErrorExpr(state.compiled);
  const whereClause = getActiveFilterWhereClause();
  const countSql = `
    WITH annotated AS (
      SELECT
        c.*,
        (${modifiedExpr}) AS __is_modified,
        (${errorExpr}) AS __has_error
      FROM cleaned_view c
      LEFT JOIN raw_input r ON c.__rowid = r.__rowid
    )
    SELECT COUNT(*) AS filtered_rows FROM annotated ${whereClause};
  `;
  const filteredRows = Number((await state.conn.query(countSql)).toArray()[0]?.filtered_rows || 0);
  state.tableStats.filteredRows = filteredRows;
  const useAllRows = state.previewPageSize === "all";
  const totalPages = useAllRows ? 1 : Math.max(1, Math.ceil(filteredRows / Number(state.previewPageSize)));
  if (state.previewPage > totalPages) state.previewPage = totalPages;
  const limitOffsetClause = useAllRows
    ? ""
    : `LIMIT ${Number(state.previewPageSize)} OFFSET ${(state.previewPage - 1) * Number(state.previewPageSize)}`;
  const previewSql = `
    WITH annotated AS (
      SELECT
        c.*,
        (${modifiedExpr}) AS __is_modified,
        (${errorExpr}) AS __has_error
      FROM cleaned_view c
      LEFT JOIN raw_input r ON c.__rowid = r.__rowid
    )
    SELECT * FROM annotated
    ${whereClause}
    ${limitOffsetClause};
  `;
  const result = await state.conn.query(previewSql);
  const rows = result.toArray().map((r) => ({ ...r }));
  renderTable(rows);
  elements.previewPageInfo.textContent = useAllRows
    ? `All rows (${filteredRows.toLocaleString()})`
    : `Page ${state.previewPage} / ${totalPages}`;
  elements.previewPrev.disabled = useAllRows || state.previewPage <= 1;
  elements.previewNext.disabled = useAllRows || state.previewPage >= totalPages;
}

function renderTable(rows) {
  if (!rows.length) {
    elements.tableWrap.innerHTML = '<div class="empty-state">No rows match this filter.</div>';
    return;
  }
  const visibleColumns = Object.keys(rows[0]).filter((k) => !k.startsWith("__"));
  let html = "<table><thead><tr>";
  for (const col of visibleColumns) html += `<th>${escapeHtml(col)}</th>`;
  html += "</tr></thead><tbody>";
  for (const row of rows) {
    const classes = [];
    if (row.__is_modified) classes.push("modified");
    if (row.__has_error) classes.push("has-error");
    html += `<tr class="${classes.join(" ")}">`;
    for (const col of visibleColumns) {
      const raw = row[col];
      const safe = raw === null || raw === undefined ? "" : String(raw);
      html += `<td>${escapeHtml(safe)}</td>`;
    }
    html += "</tr>";
  }
  html += "</tbody></table>";
  elements.tableWrap.innerHTML = html;
}

async function exportData(format) {
  if (!state.compiled || !state.conn) return;
  const outputName = `cleaned_${Date.now()}.${format}`;
  const selectSql = `SELECT ${state.compiled.outputColumns.map(quoteIdent).join(", ")} FROM cleaned_view`;
  if (format === "csv") {
    await state.conn.query(`COPY (${selectSql}) TO ${quoteLiteral(outputName)} (HEADER, DELIMITER ',');`);
  } else if (format === "parquet") {
    await state.conn.query(`COPY (${selectSql}) TO ${quoteLiteral(outputName)} (FORMAT 'parquet');`);
  } else if (format === "json") {
    await state.conn.query(`COPY (${selectSql}) TO ${quoteLiteral(outputName)} (FORMAT 'json');`);
  } else {
    return;
  }
  const bytes = await state.db.copyFileToBuffer(outputName);
  const blobType = format === "parquet" ? "application/octet-stream" : "text/plain;charset=utf-8";
  const blob = new Blob([bytes], { type: blobType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `cleaned.${format}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function copyRecipeToClipboard() {
  if (!state.recipe || !state.hasData) return;
  applyUiToRecipe();
  const text = JSON.stringify(state.recipe, null, 2);
  await navigator.clipboard.writeText(text);
  elements.fileMeta.textContent = "Recipe JSON copied to clipboard.";
}

let recomputeTimer = null;
function scheduleRecompute() {
  clearTimeout(recomputeTimer);
  recomputeTimer = setTimeout(() => {
    recompute().catch((error) => {
      elements.tableWrap.innerHTML = `<div class="empty-state">Error: ${error.message}</div>`;
    });
  }, 80);
}

function setupEvents() {
  resetDataState();
  elements.fileInput.addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (file) handleFile(file);
  });
  elements.dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    elements.dropzone.classList.add("dragover");
  });
  elements.dropzone.addEventListener("dragleave", () => {
    elements.dropzone.classList.remove("dragover");
  });
  elements.dropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    elements.dropzone.classList.remove("dragover");
    const [file] = event.dataTransfer.files;
    if (file) handleFile(file);
  });

  [
    elements.toggleTrimWhitespace,
    elements.toggleDateNormalization,
    elements.toggleDeduplicate,
    elements.toggleDropEmptyRows,
    elements.toggleDropErrorRows,
    elements.dedupeColumn
  ].forEach((el) => el.addEventListener("change", scheduleRecompute));

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      state.activeFilter = tab.dataset.filter;
      state.previewPage = 1;
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      renderPreview().catch((error) => {
        elements.tableWrap.innerHTML = `<div class="empty-state">Preview error: ${error.message}</div>`;
      });
    });
  });

  elements.copyRecipe.addEventListener("click", () => {
    copyRecipeToClipboard().catch((error) => {
      elements.fileMeta.textContent = `Copy failed: ${error.message}`;
    });
  });
  elements.exportCsv.addEventListener("click", () => exportData("csv"));
  elements.exportParquet.addEventListener("click", () => exportData("parquet"));
  elements.exportJson.addEventListener("click", () => exportData("json"));
  elements.previewPageSize.addEventListener("change", () => {
    const value = elements.previewPageSize.value;
    state.previewPageSize = value === "all" ? "all" : Number(value);
    state.previewPage = 1;
    renderPreview().catch((error) => {
      elements.tableWrap.innerHTML = `<div class="empty-state">Preview error: ${error.message}</div>`;
    });
  });
  elements.previewPrev.addEventListener("click", () => {
    if (state.previewPage <= 1) return;
    state.previewPage -= 1;
    renderPreview().catch((error) => {
      elements.tableWrap.innerHTML = `<div class="empty-state">Preview error: ${error.message}</div>`;
    });
  });
  elements.previewNext.addEventListener("click", () => {
    state.previewPage += 1;
    renderPreview().catch((error) => {
      elements.tableWrap.innerHTML = `<div class="empty-state">Preview error: ${error.message}</div>`;
    });
  });
}

setupEvents();
