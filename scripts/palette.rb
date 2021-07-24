PALETTE = [
  0x000000ff, # black
  0xffffffff, # white
  0xbd2f25ff, # red
  0xfab012ff, # yellow/orange
  0x0f8528ff, # green
  0x38a0c7ff, # cyan
  0x003090ff, # blue
  0xc0c0c0ff, # gray
]

if $0 == __FILE__
  PALETTE.each do |c|
    puts "  \"rgb(%3d, %3d, %3d)\"" % [c / 0x1000000, c / 0x10000 & 0xff, c / 0x100 & 0xff]
  end
end
