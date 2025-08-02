require "color_diff"
require "oily_png"
require "./palette"
require "./color-diff"

Dir.mkdir("tmp") unless File.directory?("tmp")

system("magick", "hald:16", "-depth", "8", "-colorspace", "sRGB", "hald16-depth8.png")

PALETTE2 = PALETTE.map do |r, g, b|
  [[r, g, b], (r << 24) + (g << 16) + (b << 8) + 255]
end

img = ChunkyPNG::Image.from_file("hald16-depth8.png")
4096.times do |y|
  4096.times do |x|
    c = img[x, y]
    c = [(c >> 24) & 255, (c >> 16) & 255, (c >> 8) & 255]
    _, c = PALETTE2.min_by {|c0,| color_diff(c0, c) }
    img[x, y] = c
  end
end
img.save("remap.png")
