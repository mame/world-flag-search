require "json"

countries = JSON.parse(File.read("countries.json"), symbolize_names: true)
features = JSON.parse(File.read("features.json"), symbolize_names: true)
names = JSON.parse(File.read("names.json"), symbolize_names: true)
names.delete(:"be-x-old")

json = []
countries.each do |country|
  next if country[:skip]
  feature = features.find {|feature| feature[:name] == country[:a2] }[:values]
  name = names.to_h {|locale, name| [locale, name[country[:a2].to_sym]] }
  entry = {
    a2: country[:a2],
    a3: country[:a3],
    name: country[:name],
    feature: feature,
    names: name,
  }
  json << entry
end
File.write("../flags.json", JSON.generate(json))
