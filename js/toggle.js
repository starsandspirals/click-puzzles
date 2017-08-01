function toggle() {
	
	if (x.className == "nav") {
		x.className += " toggle";
	} 
	else {
		x.className = "nav";
	}
	console.log("toggled!");
	console.log(x.className);

}

var menu = document.getElementById("menu");
var x = document.getElementById("nav");

menu.addEventListener("click", toggle);