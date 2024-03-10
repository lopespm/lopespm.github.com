

module Jekyll


# Does not work well, would need optimizations, etc
# This would encode to webp atomatically
#
#   class GeneratorOptImg < Jekyll::Generator
#     def generate(site)
#       for f in site.static_files do
#         if (f.path.end_with? '.png' and f.path.include? "/files/")
#           destination_original = f.destination("#{Dir.pwd}/public")
#           dest_webp = destination_original[0...-4] + ".webp"
#           exec( "cwebp -q 50 #{f.path} -o #{dest_webp}" )
#         end
#       end

#     end
#   end


  class OptimizedImageTag < Liquid::Tag
    @img = nil
    @title = nil
    @title_alt = nil
    @class = ''
    @width = ''
    @height = ''

    def initialize(tag_name, markup, tokens)
      if markup =~ /(\S.*\s+)?(https?:\/\/|\/)(\S+)(\s+\d+\s+\d+)?(\s+.+)?/i
        @class = $1 || ''
        @img = $2 + $3
        if $5
          @title = $5
          @title_alt = $5.strip
        end
        if $4 =~ /\s*(\d+)\s+(\d+)/
          @width = $1
          @height = $2
        end
      end
      super
    end

    def render(context)
      output = super
      if @img
        #exec( "mkdir -p '$(dirname #{Dir.pwd}/public#{@img}.png)'" )
        #exec( "touch #{Dir.pwd}/public#{@img}.asdasdasdas" )
        #exec( "cwebp -q 50 #{Dir.pwd}/public#{@img}.png -o #{Dir.pwd}/public#{@img}.webp" )
        return "<center>
          <picture aria-label=\"#{@title_alt}\">
             <source type=\"image/webp\" srcset=\"#{@img}.webp\" aria-label=\"#{@title_alt}\">
             <source type=\"image/png\" srcset=\"#{@img}.png\" aria-label=\"#{@title_alt}\">
             <img src=\"#{@img}.png\" aria-label=\"#{@title_alt}\">
           </picture>
         </center>"
      else
        "Error processing input, expected syntax: {% img [class name(s)] /url/to/image [width height] [title text] %}"
      end
    end
  end
end


Liquid::Template.register_tag('imgopt', Jekyll::OptimizedImageTag)
