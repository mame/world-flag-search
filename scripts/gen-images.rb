require "json"

Dir.mkdir("tmp") unless File.directory?("tmp")

JSON.parse(File.read("countries.json"), symbolize_names: true).each do |country|
  a2 = country[:a2].downcase

  svg = File.join("svg", a2 + ".svg")
  png = "../public/images/flags/#{ a2 }.png"
  tmp = File.join("tmp", a2 + ".png")

  puts "generating #{ png } and #{ tmp }..."

  system("inkscape", "--without-gui", "--export-width=240", "--file=" + svg, "--export-png=" + png)

  system("optipng", "-fix", "-i0", "-o7", png)
  system("advdef", "-z4", png)
  system("advpng", "-z4", png)

  system("inkscape", "-o", tmp, "-w", "300", "-h", "300", "--export-background=FFFFFF", svg)
end
