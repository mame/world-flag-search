require "oily_png"
require "json"
require "./color-diff"

PALETTE = JSON.parse(File.read("../palette.json")).map do |s|
  [s[1, 2].hex, s[3, 2].hex, s[5, 2].hex]
end

MEMO = {}
def get_nearest_palette_color(c)
  MEMO[c] ||= begin
    c = [(c >> 24) & 255, (c >> 16) & 255, (c >> 8) & 255]
    (0...PALETTE.size).min_by {|i| color_diff(PALETTE[i], c) }
  end
end

class Histogram
  def initialize(counts = [0] * 8)
    @counts = counts
  end

  attr_reader :counts

  def merge(other)
    h = []
    @counts.zip(other.counts) {|c1, c2| h << c1 + c2 }
    Histogram.new(h)
  end

  def normalize
    total = @counts.inject(&:+)
    @counts.map {|c| (c * 255.0 / total).round }
  end

  def [](i)
    @counts[i]
  end

  def []=(i, v)
    @counts[i] = v
  end
end

json = []
JSON.parse(File.read("countries.json"), symbolize_names: true).each do |country|
  a2 = country[:a2].downcase
  png = File.join("tmp", a2 + ".png")

  puts "processing #{ png }..."

  img = ChunkyPNG::Image.from_file(png)
  histograms = (0..2).map { (0..2).map { Histogram.new } }
  img.pixels.each_with_index do |n, i|
    x = i % 300 / 100
    y = i / 300 / 100
    histograms[y][x][get_nearest_palette_color(n)] += 1
  end

  h_00 = histograms[0][0]
  h_01 = histograms[0][1]
  h_02 = histograms[0][2]
  h_10 = histograms[1][0]
  h_11 = histograms[1][1]
  h_12 = histograms[1][2]
  h_20 = histograms[2][0]
  h_21 = histograms[2][1]
  h_22 = histograms[2][2]

  h_00_01_02 = h_00.merge(h_01).merge(h_02)
  h_10_11_12 = h_10.merge(h_11).merge(h_12)
  h_20_21_22 = h_20.merge(h_21).merge(h_22)

  h_00_10_20 = h_00.merge(h_10).merge(h_20)
  h_01_11_21 = h_01.merge(h_11).merge(h_21)
  h_02_12_22 = h_02.merge(h_12).merge(h_22)

  h_00_11_22 = h_00.merge(h_11).merge(h_22)
  h_20_11_02 = h_20.merge(h_11).merge(h_02)

  json << {
    a2: country[:a2],
    values: [
      h_00_01_02, h_10_11_12, h_20_21_22,
      h_00_10_20, h_01_11_21, h_02_12_22,
      h_00_11_22, h_20_11_02
    ].map {|h| h.normalize }.flatten
  }
end

File.binwrite(File.join(__dir__, "features.json"), JSON.generate(json))
