# fetch flag SVG files and article titles from Wikipedia

require "open-uri"
require "json"
require "cgi"
require "digest/md5"

Dir.mkdir("cache") unless File.directory?("cache")
Dir.mkdir("svg") unless File.directory?("svg")

class Fetcher
  def fetch_json(url)
    cache = File.join("cache", Digest::MD5.hexdigest(url))
    if File.readable?(cache)
      json = File.read(cache).lines.drop(1).join
    else
      json = URI.open(url) {|f| f.read }
      sleep 0.1
      File.write(cache, url + "\n" + json)
    end
    JSON.parse(json)
  end
end

class WikipediaFetcher < Fetcher
  BASE_URL = "http://en.wikipedia.org/w/api.php?action=query&redirects=&format=json"
  CONTENT_API = "&prop=revisions&titles=<>&rvprop=content"
  IMAGE_API = "&prop=imageinfo&titles=File:<>&iiprop=url"
  LANGLINKS_API = "&prop=langlinks&titles=<>&"

  def fetch(api, entry)
    entry = CGI.escape(entry)
    fetch_json(BASE_URL + api.sub("<>") { entry })
  end

  def find_page(json)
    json = json["query"]["pages"]
    json.find {|k, v| k.to_i > 0 }.last
  end

  def content(title)
    json = fetch(CONTENT_API, title)
    find_page(json)["revisions"].first["*"]
  end

  def country_flag(a3)
    # adhoc hack
    return "Flag of Samoa.svg" if a3 == "WSM"

    data = "Template:Country_data_" + a3
    src = content(data)
    raise data unless /^\| alias = (?<entry>.*)/ =~ src
    raise data unless
      /^\| flag alias-ats = (?<flag>[^|<]*)/ =~ src ||
      /^\| flag alias-local = (?<flag>[^|<]*)/ =~ src ||
      /^\| flag alias = (?<flag>[^|<]*)/ =~ src
    flag = flag.gsub(/<!-- .*? -->/, "")
    flag = flag.gsub(/<noinclude>/, "")
    flag.strip
  end

  def save_flag_svg(a2, a3)
    flag = country_flag(a3)

    # adhoc hack
    case flag
    when "Flag of Federated States of Micronesia.svg"
      flag = "Flag of the Federated States of Micronesia.svg"
    when "Flag of the Seychelles.svg"
      flag = "Flag of Seychelles.svg"
    end

    ext = File.extname(flag)
    p ext if ext != ".svg"
    svg = File.join("svg", a2.downcase + ext)
    unless File.readable?(svg)
      url = image_url(flag.gsub(" ", "_"))
      dat = URI.open(url, "rb") {|f| f.read }
      File.binwrite(svg, dat)
    end
  end

  def image_url(file)
    json = fetch(IMAGE_API, file)
    json["query"]["pages"].first.last["imageinfo"].first["url"]
  end

  def langlinks(file)
    continue = { "continue" => "" }
    langlinks = []
    while continue
      continue = continue.map do |k, v|
        CGI.escape(k) + "=" + CGI.escape(v)
      end.join("&")
      json = fetch(LANGLINKS_API + continue, file)
      langlinks.concat find_page(json)["langlinks"]
      continue = json["continue"]
    end
    hash = {}
    langlinks.each do |langlink|
      lang = langlink["lang"]
      entry = langlink["*"]
      hash[lang] = entry
    end
    hash
  end
end

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
# SHN: United Kingdom
# BES: France
# BVT: Norway
# SJM: Norway
# MAF: France
# UMI: USA
IGNORE_ISO_A3 = %w(HMD BVT SJM UMI SHN MAF BES)

countries = []
content = Wikipedia.content("Comparison of IOC, FIFA, and ISO 3166 country codes")
content.scan(/^\|-\s*\n(.*)/) do |s,|
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

Locales = %w(en ja)

countries.each_with_index do |country, idx|
  puts "#{ idx + 1 }: #{ country["name"] } (#{ country["a3"] })"

  Wikipedia.save_flag_svg(country["a2"], country["a3"])

  name = country.delete("name")
  langlinks = { "en" => name, **Wikipedia.langlinks(name) }
  names = {}
  Locales.each do |lang|
    names[lang] = langlinks[lang] || raise("No article in #{ lang } found for #{ name }")
  end
  country["names"] = names
end

File.write("countries.json", JSON.pretty_generate(countries))
