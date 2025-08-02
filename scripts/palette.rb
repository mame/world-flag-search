require "json"

PALETTE = JSON.load(File.read("../palette.json")).map do |s|
  [s[1, 2].hex, s[3, 2].hex, s[5, 2].hex]
end

if $0 == __FILE__
  PALETTE.each do |c|
    puts "  \"rgb(%3d, %3d, %3d)\"" % [c / 0x1000000, c / 0x10000 & 0xff, c / 0x100 & 0xff]
  end
end
