---
layout: note
title: "Obsidian Encrypted Backup - Google Drive, Dropbox, OneDrive"
comments: true
categories: notes
tags: []
description: "Step by step guide for a custom, safe, encrypted backup, fully owned by you, for your Obsidian Notes"
ogp_image: "/files/obsidian_backup/pthumb.png"
ogp_image_twitter: "/files/obsidian_backup/pthumb.png"
published: true
---

After several years using Evernote, I've eventually migrated all my notes into Obsidian, which allowed me to have full control of my notes, in a format that I could use, move, or [leverage upon]({% post_url 2024-06-24-personal-llm %}). As a consequence, my notes would no longer live in the cloud and my personal device, so any redundancy and backups would need to be guaranteed by me, via my personal periodic backups.

Having more than a decade's worth of notes relying on a single redundancy made me somewhat uneasy, so the options I could think of were either:

1. Subscribe to [Obsidian's Sync service](https://obsidian.md/sync), which would recurrently cost $4 every month, _every month_. My encrypted notes would be tethered to Obsidian's cloud service
2. Have a custom solution that leverage's Obsidian's outstanding customizability, compress and encrypt all my notes, and use a cloud service to host this archive. I would have the flexibility to choose any cloud provider I would desire.

I've chosen option 2., using the Google Drive cloud service, and in this note will share how you can too.

<!--more-->

# How to do it

The idea is simple: use the [obsidian-shellcommands](https://obsidian.md/plugins?search=obsidian-shellcommands) shell plugin to run a custom script, whenever Obsidian quits (this event is configurable, but I find the application).

## Step 1. Custom script that encrypts and backs up all notes

First, save the below script into a folder in your computer (for example, at `/Users/yourunixname/backups/my_backup_script.sh`), and update it with your own Obsidian, backup destination folders and your own archive password:

~~~
#!/bin/zsh

obsidian_notes_folder="<your_obsidian_folder>" ; # For example, /Users/yourusername/Library/Application Support/obsidian
obsidian_notes_tar_archive="${obsidian_notes_folder}/obsidian_backup.tar.gz" ;
backup_folder="<folder_where_the_final_encrypted_backup_will_be_placed>"; # For example, /Users/yourusername/Library/CloudStorage/GoogleDrive/MyDrive/backup_folder

echo "Starting to compress obsidian notes..." ;

# Create a .tar archive that contains all the contents inside the obsidian folder
tar -czf ${obsidian_notes_tar_archive} ${obsidian_notes_folder}/obsidian_backup

# Compress the .tar archive into an encrypted .7z with password "PasswordOfYourChoosing"
# In this example, 7za installed from the nix package manager is used
/Users/yourusername/.nix-profile/bin/7za a -tzip -mem=AES256 -mx=0 -mmt=12 -pPasswordOfYourChoosing ${obsidian_notes_folder}/obsidian_backup.7z ${obsidian_notes_tar_archive} ;

# Move the .7z file into the the backup folder (e.g. your Google Drive / Dropbox / OneDrive folder)
mv ${obsidian_notes_folder}/obsidian_pedrolopes_nodes_backup.7z ${backup_folder}/obsidian_backup.7z ;

echo "Finished compressing and moving to backup folder"
~~~
{:lang="bash"}


The comments are mostly self-explanatory, but essentially this is what the script does:

1. First create a .tar archive that contains all the contents inside the obsidian folder
2. Compresses the .tar archive into a password encrypted `.7z` file. Remember to update the password with your own private password
3. Moves the `.7z` file into the destination folder, which could be the folder used by your cloud storage sync folder of choice (e.g. your Google Drive / Dropbox / OneDrive folder).

Since the final file name on `3.` is always the same, it will be re-written, but likely your cloud storage sync will keep track of the different versions, as they change, which could progressively inflate your quota usage. If that is a problem, just purge them periodically using your cloud storage interface.

You can test drive your script by granting execution privileges to your script (`chmod +x <script_file_name>`), and running `./<your_script_name>`. Your final encrypted archive should appear on the final `backup_folder`


## Step 2. Run the script when Obsidian quits

Now that we have the script ready, it makes our life easier if it is run automatically, upon a given Obsidian event, such as when Obsidian quits. Running a shell script upon a given Obsidian event is made easy by using the [obsidian-shellcommands](https://obsidian.md/plugins?search=obsidian-shellcommands). These are the steps to set it up:

**1.** Go to Obsidian -> Settings. Then select the "Community Plugins" option.

{% imgopt /files/obsidian_backup/p0 Community Plugins %}

<br/>

**1.1.** On the "Community Plugins" option, click "Browse". There, search for "Shell". The one you want to install is [Shell Commands by Jarkko Linnanvirta]((https://obsidian.md/plugins?search=obsidian-shellcommands))

{% imgopt /files/obsidian_backup/p2 Browse for Shell Commands %}

{% imgopt /files/obsidian_backup/p3 Selected Shell Commands Plugin by Jarkko Linnanvirta %}

<br/>

**2.** Now that the plugin is installed, go again to Obsidian -> Settings. You should see in the bottom left, under the "Community plugins" pane, an option named "Shell commands". Click it.

{% imgopt /files/obsidian_backup/p4 Shell Commands Plugin entrypoint %}

<br/>

**3.1.** On the "Shell commands" plugin, select the "Shell commands" tab, and inside it, click "New shell command", and the created row, click its respective cog icon. This will show you a new modal with several tabs.

**3.2.** On this command modal, select the "Environments" tab and insert on the "Default shell command" something like this: `zsh /Users/yourunixname/backups/my_backup_script.sh`. This assumes that your script is located at `/Users/yourunixname/backups/my_backup_script.sh`

{% imgopt /files/obsidian_backup/p5 New shell commands on the Environment tab %}

<br/>

**3.3.** Still on this command modal, select the "Events" tab. There you can choose when should the script execution be done. For example, search for "Obsidian quits", and enable it (there is a toggle in the right)

{% imgopt /files/obsidian_backup/p6 New shell commands on the Events tab %}

{% imgopt /files/obsidian_backup/p7 How Shell Commands looks like when everything is configured %}

<br/>

All done! After performing these steps, your backup script will run whenever you chose to, and the encrypted backup will be created and placed in the location that you chose on [Step 1.]({% post_url 2024-09-11-obsidian-backup %}#step-1-custom-script-that-encrypts-and-backs-up-all-notes) above 🎉