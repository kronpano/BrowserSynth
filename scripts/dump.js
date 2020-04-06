var dump = function(value, replacer, space) {
  replacer = replacer || null;
  space = space || 2;
  console.log(JSON.stringify(value, replacer, space));
}