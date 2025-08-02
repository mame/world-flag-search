require "json"

JSON.load(File.read("countries.json")).each do |country|
  next if country["skip"]

  name = country["a2"].downcase
  svg = File.join("svg", name + ".svg")
  png = File.join("tmp", name + ".png")
  unless File.readable?(png)
    norm = File.join("tmp", name + ".norm.png")

    system("inkscape", "-o", norm, "-w", "300", "-h", "300", "--export-background=FFFFFF", svg)
  end
end
