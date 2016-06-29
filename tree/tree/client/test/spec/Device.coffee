Device = () ->
  this.available=PhoneGap.available;
  this.platform=null;
  this.version=null;
  this.name=null;
  this.uuid=null;
  this.phonegap=null;
#  var a=this;this.getInfo(function(b){a.available=true;a.platform=b.platform;a.version=b.version;a.name=b.name;a.uuid=b.uuid;a.phonegap=b.phonegap;PhoneGap.onPhoneGapInfoReady.fire()}
