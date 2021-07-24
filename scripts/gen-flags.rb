require "./fetcher"
require "json"

Dir.mkdir("png") unless File.directory?("png")

JSON.load(File.read("countries.json")).each do |country|
  next if country["skip"]

  a2 = country["a2"].downcase

  svg = File.join("svg", a2 + ".svg")
  unless File.readable?(svg)
    svg = File.join("svg", a2 + ".png")
  end

  png = "../public/images/flags/#{ a2 }.png"
  unless File.readable?(png)
    puts "generating #{ png }..."
    if File.extname(svg) == ".png"
      system("convert", "-depth", "8", "-colors", "256", "-geometry", "240x240", "-antialias", "-background", "transparent", svg, png)
    else
      system("inkscape", "--without-gui", "--export-width=240", "--file=" + svg, "--export-png=" + png)
    end
    system("optipng", "-fix", "-i0", "-o7", png)
    system("advdef", "-z4", png)
    system("advpng", "-z4", png)
  end
end

