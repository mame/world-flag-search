require "json"

countries = JSON.parse(File.read("countries.json"), symbolize_names: true)
features = JSON.parse(File.read("features.json"), symbolize_names: true)

json = []
countries.each do |country|
  next if country[:skip]
  feature = features.find {|feature| feature[:name] == country[:a2] }[:values]
  entry = {
    a2: country[:a2],
    a3: country[:a3],
    feature: feature,
    names: country[:names],
  }
  json << entry
end
File.write("../flags.json", JSON.generate(json))
