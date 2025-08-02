require "json"

JSON.load(File.read("countries.json")).each do |country|
  next if country["skip"]

  a2 = country["a2"].downcase

  svg = File.join("svg", a2 + ".svg")

  png = "../public/images/flags/#{ a2 }.png"
  unless File.readable?(png)
    puts "generating #{ png }..."

    system("inkscape", "--without-gui", "--export-width=240", "--file=" + svg, "--export-png=" + png)

    system("optipng", "-fix", "-i0", "-o7", png)
    system("advdef", "-z4", png)
    system("advpng", "-z4", png)
  end
end
