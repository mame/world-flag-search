require "json"
require "oily_png"
require "./color-diff"

INITIAL_PALETTE = [
  "000000", # black
  "ffffff", # white
  "ff0000", # red
  "ffff00", # yellow/orange
  "00ff00", # green
  "00ffff", # cyan
  "0000ff", # blue
  "c0c0c0", # gray
].map { |n| [n[0, 2].hex, n[2, 2].hex, n[4, 2].hex] }

PALETTE_SIZE = INITIAL_PALETTE.size

puts "creating initial clusters"
countries = JSON.parse(File.read("countries.json"), symbolize_names: true)
h = Hash.new(0)
countries.each do |country|
  next if country[:skip]
  png = File.join("tmp", country[:a2].downcase + ".norm.png")
  img = ChunkyPNG::Image.from_file(png)
  img.pixels.each {|n| h[n] += 1 }
end
clusters = INITIAL_PALETTE.map { [] }
h.each do |c, count|
  c = [(c >> 24) & 255, (c >> 16) & 255, (c >> 8) & 255]
  clusters[0] << [c, count] #if count > 100
end

palette = INITIAL_PALETTE

loop do
  puts "reassigning clusters"
  new_clusters = (0...PALETTE_SIZE).map { [] }
  modified = 0
  clusters.each_with_index do |cluster, j|
    cluster.each do |c, count|
      dists = palette.map {|c0| color_diff(c0, c) }
      i = (0...PALETTE_SIZE).min_by {|i| dists[i] }
      new_clusters[i] << [c, count]
      modified += 1 if i != j
    end
  end

  puts "current palette:"
  palette.zip(new_clusters).each_with_index do |(c, cluster), i|
    count = cluster.sum {|_, count| count }
    puts "#{ i }: \e[48;2;#{c[0]};#{c[1]};#{c[2]}m    \e[0m #%02x%02x%02x (count: #{ count })" % c
  end
  puts "modified: #{ modified }"

  break if modified == 0

  clusters = new_clusters

  puts "updating the palette"
  palette = palette.map.with_index do |c0, i|
    next c0 if i < 2 || i == 7

    cluster = clusters[i]

    dist_cache = {}
    calc_dist = -> (c0) do
      dist_cache[c0] ||= cluster.sum {|c, count| color_diff(c0, c) * count }
    end

    loop do
      neighbers = []
      (-1..1).each do |dr|
        next if c0[0] + dr < 0 || c0[0] + dr > 255
        (-1..1).each do |dg|
          next if c0[1] + dg < 0 || c0[1] + dg > 255
          (-1..1).each do |db|
            next if c0[2] + db < 0 || c0[2] + db > 255
            c1 = [c0[0] + dr, c0[1] + dg, c0[2] + db]
            neighbers << [c1, calc_dist.call(c1)]
          end
        end
      end
      c1, dist = neighbers.min_by {|c1, dist| dist }
      break if c0 == c1
      c0 = c1
    end

    c0
  end
end

palette = palette.map {|c| "#%02x%02x%02x" % c }

File.write("../palette.json", JSON.generate(palette))
