const specConsumer = require('shift-spec-consumer');

const fs = require('fs');
const spec = specConsumer(fs.readFileSync('spec.idl', 'utf8'), fs.readFileSync('attribute-order.conf', 'utf8'));
exports.spec = spec

function getType(node){
	if(node.parents && node.children && node.attributes){
		return "node";
	}else if(node.kind && node.argument){
		return "namedType";
	}else{
		console.log("invalid node type")
		process.exit(1);
	}
}

function prettyPrint(){
	console.log(name);

	switch(getType(cur_node)){
		case "node":
			if(cur_node.attributes.length == 0){
				console.log("no attributes, children: ");
				cur_node.children.forEach(function(child){
					console.log(child);
				});
			}

			cur_node.attributes.forEach(function(attr) {
				if (typeof attr.type.argument == "string") {
					console.log(attr.name, ":", attr.type.argument);

				}
				else if(typeof attr.type.argument == "object"){
					console.log(attr.name, ":", attr.type.kind, "[", attr.type.argument.argument, "]");
				}else{
					console.log("error typeof", typeof attr.type.argument);
					process.exit(1);
				}
			});

			break
		case "namedType":

			console.log("kind:", cur_node.kind);
			suffix = " "
			if(cur_node.kind == "union"){
				suffix = " | "
			}

			str = ""
			for (var i=0; i<cur_node.argument.length; i++) {
				arg = cur_node.argument[i]
				if (i == cur_node.argument.length - 1){
					str += arg.argument;
					continue
				}

				str += arg.argument + suffix;
			}

			console.log(str);
			break;
	}
	
	console.log("\n");
}

function next(name){
	var next_node = nodes.get(name);
	if (!next_node) {
		next_node = namedTypes.get(name);	
	}

	return [name, next_node];
}

function set(node, key, value){
	var found = false

	switch(getType(node)){
		case "node":
			arr = node.attributes;
			break
		case "namedType":
			arr = node.properties;
			break
	}

	for(var i=0; i<arr.length; i++){
		attr = arr[i];
		if(attr.name == key){
			node.attributes[i].type.argument = value
			found = true
		}
	}

	if(!found){
		node.attributes.push({name: key, type: {argument: value}})
	}
}

var nodes = spec["nodes"];
var namedTypes = spec["namedTypes"];

console.log("\nBEFORE:")
var [name, cur_node] = next("Function");
prettyPrint();

set(cur_node, "params", "List")
set(cur_node, "restParams", "BindingPattern"); 
console.log("AFTER:")
prettyPrint()

console.log("=".repeat(41) + "\n")

var [name, cur_node] = next("BindingPattern")
prettyPrint();

console.log("\nBEFORE:")
var [name, cur_node] = next("ObjectBinding")
prettyPrint();
set(cur_node, "rest",  {kind: "nullable", argument: "Identifier"});
console.log("AFTER:")
prettyPrint();
console.log("=".repeat(41) + "\n")

var [name, cur_node] = next("BindingProperty")
prettyPrint();

var [name, cur_node] = next("BindingPropertyIdentifier")
prettyPrint();

