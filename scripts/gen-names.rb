require "./fetcher"
require "erb"
require "json"

wikipedia = WikipediaFetcher.new

RESOURCE_DIR = "res"

titles = { nil => {} }
idx = 0
count = Hash.new(0)

JSON.load(File.read("countries.json")).each do |country|
  next if country["skip"]

  idx += 1

  langlinks = wikipedia.langlinks(country["wikipedia"] || country["name"])

  p country if langlinks["fr"] && !langlinks["ja"]
  langlinks.keys.each {|k| count[k] += 1 }
  titles[nil][country["a2"]] = country["name"]
  langlinks.each do |k, v|
    titles[k] ||= {}
    titles[k][country["a2"]] = v
  end
end

# save country name resources
output_titles = {}
([nil] + count.select {|k, v| v == idx }.keys).each do |lang|
  output_titles[lang || "en"] = titles[lang]
end
File.write(File.join(__dir__, "names.json"), JSON.generate(output_titles))
