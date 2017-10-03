require_relative 'Stash'
require 'rspec'
require 'json'

describe "#initialize" do
  context "without options" do
    it "should complain" do
      expect {s = Stash.new()}.to raise_exception
    end
  end

  context "with options" do
    it "should not complain" do
      expect {s = Stash.new(:name=>"rspec-test")}.not_to raise_exception
    end
  end

end

describe "all methods: " do

  before :all do
    @stash = Stash.new(:name => "rspec-test")
    @value = (0...8).map { (65 + rand(26)).chr }.join # wtfbbq
  end

  after :all do
    @stash.deleteMany(["json-test","a","b","c","test"])
  end

  it "get should return 0 rows at first" do
    expect( @stash.getOne("test").length ).to eq(0)
  end

  it "set should not raise exception" do
    expect { @stash.setOne("test", @value) }.not_to raise_exception
  end

  it "get should get set value" do
    expect( @stash.getOne("test")[0] ).to eq(@value)
  end

  it "delete should delete" do
    expect { @stash.deleteOne("test") }.not_to raise_exception
  end

  it "get should return 0 rows now" do
    expect(@stash.getOne("test").length).to eq(0)
  end

  it "setMany multiple values from hash" do
    expect { @stash.setMany({"a"=>1,"b"=>2,"c"=>3}) }.not_to raise_exception
  end

  it "getMany multiple values from array" do
    response = @stash.getMany({:keys=>['a','b','c']})
    expect(response.keys).to   match_array(['a','b','c'])
    expect(response.values).to match_array(['1','2','3'])
  end

  it "deleteMany multiple values from array" do
    expect {@stash.deleteMany(['a','b','c'])}.not_to raise_exception
  end

  it "getMany multiple values from array should return 0 rows" do
    expect(@stash.getMany({:keys=>['a','b','c']}).length).to eq(0)
  end

  it "should accept json" do

    hJson = {"name"=>"Testy Dude","age"=>0,"tags"=>["awesome","rad"]}
    sJson = hJson.to_json
    
    expect { @stash.setOne("json-test", sJson) }.not_to raise_exception

    parsedJson = JSON.parse @stash.getOne("json-test")[0]

    expect( parsedJson['name'] ).to eq(hJson['name'])
    expect( parsedJson['age']  ).to eq(hJson['age'])
    expect( parsedJson['tags'] ).to match_array(hJson['tags'])

  end


end
