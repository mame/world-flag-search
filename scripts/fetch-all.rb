# get flag svg files and article titles from wikipedia

require "./fetcher"

Wikipedia = WikipediaFetcher.new

def find_iso_a2(iso_a3)
  Wikipedia.content("ISO_3166-1").scan(/^\|-(.*?)(?=^\|[\-\}])/m) do |s,|
    s = s.gsub(/\{\{sort\|.*?\|(.*?)\}\}/) { $1 }
    s = s.gsub(/<!--.*?-->/, "")
    if s =~ /\[\[.*?\]\].*?\{\{mono\|(\w+)\}\}.*?\{\{mono\|(\w+)\}\}/m
      return $1 if $2 == iso_a3
    end
  end
  nil
end

# HMD: Australia
# BVT: Norway
# SJM: Norway
# UMI: USA
# SHN: United Kingdom
# MAF: France
# BES: France
IGNORE_ISO_A3 = %w(HMD BVT SJM UMI SHN MAF BES)

countries = []
countries << { "a2" => "AQ", "a3" => "ATA", "name" => "Antarctica" }
content = Wikipedia.content("Comparison of IOC, FIFA, and ISO 3166 country codes")
content.scan(/^\|-\n(.*)/) do |s,|
  s = s.gsub(/<ref.*?<\/ref>|<ref.*?\/>/, "")
  if s =~ /^\|\{\{flagicon\|(\w+)(?:\|local)?\}\}\|\|(.*?)\|\|(\w+| *)\|\|(\w+| *)\|\|(\w+| *)\|\|/
    wikipedia_id, name, ioc, fifa, iso_a3 = $1, $2, $3, $4, $5
    next if IGNORE_ISO_A3.include?(iso_a3)
    iso_a3 = iso_a3.strip.empty? ? nil : iso_a3
    name = name[/\[\[(.*?)(?:\||\]\])/, 1]
    next unless iso_a3
    iso_a2 = find_iso_a2(iso_a3)
    countries << { "a2" => iso_a2, "a3" => iso_a3, "name" => name }
  end
end

File.write("countries.json", JSON.pretty_generate(countries))

idx = 0

JSON.load(File.read("countries.json")).each do |country|
  next if country["skip"]

  puts "#{ idx += 1 }: #{ country["name"] }"

  Wikipedia.save_flag_svg(country["a2"], country["a3"])

  Wikipedia.langlinks(country["name"])
end
