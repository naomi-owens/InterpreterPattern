/*
Sample test input:
	var regex = 'dog'.or('cat').repeat().and('raining')
	regex.interpret('dogdograining') or regex.interpret('dog dog raining')
*/

//Stream Class
function Stream(str){
	this.string = str;
	this.position = 0;

	this.nextAvailable = function(n){
		var characters = this.string.split('');
		var nextAvailable = characters.slice(this.position, this.position + n);
		this.position = this.position + n;
		return nextAvailable;
	};
}

//Abstract Class (REGULAR EXPRESSION)
function RegularExpression(){}
RegularExpression.prototype = {
	interpret: function(input){
		if(typeof input === "string"){
			var stream = new Stream(input);
			this._inputState = new Array();
			this._inputState.push(stream)
		} 
		else{
			this._inputState = input;
		}
	}
}

//Concrete Class (AND)
function and(expression1, expression2){
	and.prototype.interpret = function(string){
		var finalState = new Array();
		finalState = finalState.concat(expression2.interpret(expression1.interpret(string)));
		return finalState;
	}
}
and.prototype = new RegularExpression();


//Concrete Class (OR)
function or(expression1, expression2){	
	or.prototype.interpret = function(input){
		var finalState = new Array();
		finalState = finalState.concat(expression1.interpret(input), expression2.interpret(input));
		return finalState;
	}
}
or.prototype = new RegularExpression();

//Concrete Class (REPEAT)
function repeat(expression){
	repeat.prototype.interpret = function(input){
		var astate = expression.interpret(input);
		var finalState = new Array();
		while(astate.length >= 1){
			finalState = finalState.concat(astate);
			astate = expression.interpret(astate);
		}		
		return finalState;
	}
}
repeat.prototype = new RegularExpression();

//Concreate Class (LITERAL)
function Literal(string){
	this.componentList = string.split('');
	Literal.prototype.interpret = function(input){
		RegularExpression.prototype.interpret.call(this, input);
		var finalState = new Array();
		var stream;
		for (var i = 0; i < this._inputState.length; i++){
			//Using the underscore clone method otherwise both arrays have the same reference.
			stream = _.clone(this._inputState[i]);
			if(stream.nextAvailable(this.componentList.length).toString() === this.componentList.toString()){
				//This allows you to enter a stream to match that contains spaces
				if(stream.string.indexOf(" ") !== -1){
					stream.nextAvailable(1);
				}
				finalState.push(stream);
			}
		}
		return finalState;
	}
}
Literal.prototype = new RegularExpression();


//String Monkeypatching
String.prototype.and = function(string){
	return new and(this.valueOf().asRExp(), string.asRExp());
}
String.prototype.or = function(string){
	return new or(string.asRExp(), this.valueOf().asRExp());
}
String.prototype.repeat = function(){
	return new repeat(this.valueOf().asRExp());
}
String.prototype.asRExp = function(){
	return new Literal(this);
}

/*This part allows the methods to be called on expressions
Allows you to create an expression chain like this
'dog'.or('cat').repeat().and('raining')*/
RegularExpression.prototype.repeat = function(){
	return new repeat(this);
}
RegularExpression.prototype.and = function(string){
	return new and(this, string.asRExp());
}
RegularExpression.prototype.or = function(string){
	return new or(this, string.asRExp());
}