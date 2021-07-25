require "color_diff"
require "oily_png"
require "./palette"

Dir.mkdir("tmp") unless File.directory?("tmp")

system("convert", "hald:16", "-depth", "8", "-colorspace", "sRGB", "hald16-depth8.png")

PALETTE2 = PALETTE.map do |n|
  [
    ColorDiff::Color::RGB.new((n >> 24) & 255, (n >> 16) & 255, (n >> 8) & 255),
    n
  ]
end

img = ChunkyPNG::Image.from_file("hald16-depth8.png")
4096.times do |y|
  4096.times do |x|
    c = img[x, y]
    c = ColorDiff::Color::RGB.new((c >> 24) & 255, (c >> 16) & 255, (c >> 8) & 255)
    _, c = PALETTE2.min_by {|c0,| ColorDiff.between(c0, c) }
    img[x, y] = c
  end
end
img.save("remap.png")
