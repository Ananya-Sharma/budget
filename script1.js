var budgetController = (function(){

var Expenses = function(id,description,value){
    this.id = id;
    this.description= description;
    this.value = value;
    this.percentage = -1;
}

Expenses.prototype.calcPercent = function(totalInc){
    if(totalInc >0)
    this.percentage = Math.round((this.value/totalInc)*100);
    else
    this.percentage = -1;
}

Expenses.prototype.getPercent = function(){
    return this.percentage;
}

var Income = function(id,description,value){
    this.id = id;
    this.description= description;
    this.value = value;
}

var data = {
    allItems : {
        exp : [],
        inc : []
    },
    total : {
        exp :0,
        inc:0
    },
    budget : 0,
    percentage : -1
}

var totalValue =function(type){
    var sum=0;
    data.allItems[type].forEach(function(current){
        sum += parseFloat(current.value);
    })
    data.total[type]=sum;
}

return {
    addItem : function(type,description,value){

        var ID,item;

        if(data.allItems[type].length>0)
        ID = data.allItems[type][data.allItems[type].length-1].id +1;
        else
        ID = 0;
        if(type ==='exp'){
            item = new Expenses(ID,description,value);
        }
        else{
            item = new Income(ID, description,value);
        }

        data.allItems[type].push(item);

        return item;
        
    },

    calculateBudget : function(){
        
        totalValue('inc');
        totalValue('exp');
        
        data.budget = data.total.inc - data.total.exp;

        if(data.total.inc>0)
        data.percentage = Math.round((data.total.exp/data.total.inc)*100);
        else
        data.percentage = -1;
        return {
            income : data.total.inc,
            expense : data.total.exp,
            budget : data.budget,
            percentage : data.percentage
        }
    },

    deleteItem : function(type,id){
            
        var idx= -1,idxs;

       /* idxs = data.allItems[type].map(function(current){
            return current.id;
        })
        idx = idxs.indexOf(id);8*/

        for(var i =0;i<data.allItems[type].length;i++){
            if(data.allItems[type][i].id === id)
            idx=i;
        }
        if(idx !== -1)
        data.allItems[type].splice(idx,1);

    },

    calculatePercentages : function(){

        data.allItems.exp.forEach(function(current){
            current.calcPercent(data.total.inc);
        })
    },

    getPercentages : function(){
        
        var percents;
        percents = data.allItems.exp.map(function(current){
            return current.getPercent();
        })

        return percents;
    },

    testing : function(){
        return data;
    }
}


})();


var UIController = (function(){

var DOMstrings = {
    inputType : '.add_type',
    inputDescription :'.add_description',
    inputValue : '.add_value',
    inputButton : '.add_btn',
    incomeList : '.income_list',
    expenseList : '.expenses_list',
    budgetLabel : '.budget-value',
    incomeLabel : '.budget-income--value',
    expenseLabel : '.budget-expenses--value',
    percentageLabel : '.budget-expenses--percentage',
    container : '.container',
    itemPercent : '.item__percentage',
    monthLabel : '.budget_title_month'
}

var forEachNode = function(list,callback){
    for(var i=0;i<list.length;i++)
    callback(list[i],i);
}

var formatNumber = function(type,num){

    var numSplit,int,dec;
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.');
    int = numSplit[0];
    dec = numSplit[1];

    if(int.length>3)
    int = int.substr(0,int.length-3)+','+int.substr(int.length-3,3);

    return (type === 'exp'?'-':'+')+int+'.'+dec;
}

return {
    getDomstrings : function(){
        return DOMstrings;
    },

    getInput : function(){

        return {
            type : document.querySelector(DOMstrings.inputType).value,
            description : document.querySelector(DOMstrings.inputDescription).value,
            value : document.querySelector(DOMstrings.inputValue).value
        }
    },

    displayValues : function(type,obj){
      
        var html,newHtml,element;
        if(type === 'inc'){
            element = DOMstrings.incomeList;
            html= '<div class="item clearfix" id="inc-%id%" ><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }

        else if(type === 'exp'){
            element = DOMstrings.expenseList;
            html ='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }
        
        newHtml = html.replace('%id%',obj.id);
        newHtml = newHtml.replace('%description%',obj.description);
        newHtml = newHtml.replace('%value%',formatNumber(type,obj.value));
        
        
        document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);

    },
    displayBudget : function(calc){
        var type;
        if(calc.income>calc.expense)
        type = 'inc';
        else
        type= 'exp';
        document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(type,calc.budget);
        document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber('inc',calc.income);
        document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber('exp',calc.expense);
        if(calc.percentage>0)
        document.querySelector(DOMstrings.percentageLabel).textContent = calc.percentage + '%';
        else
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
    },

    deleteListItems : function(selectorId){

        var el;
        el = document.getElementById(selectorId);
        el.parentNode.removeChild(el);
    },

    displayPercentages : function(percent){
        var fields;

        fields = document.querySelectorAll(DOMstrings.itemPercent);

        forEachNode(fields,function(current,index){
            if(percent[index]>0)
            current.textContent = percent[index]+'%';
            else
            current.textContent = '---';
        })
    },

    displayMonth : function(){

        var now, year,month,months;

        now = new Date();
        year = now.getFullYear();
        month = now.getMonth();
        months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

        document.querySelector(DOMstrings.monthLabel).textContent = months[month] + ' '+ year;
    },

    changedType : function(){

        var fields;
        fields = document.querySelectorAll(DOMstrings.inputDescription+','+DOMstrings.inputValue+','+DOMstrings.inputType);

        forEachNode(fields,function(current,index){
            current.classList.toggle('red-focus');
        })

        document.querySelector(DOMstrings.inputButton).classList.toggle('red');
    },

    clearItems : function(){

        var fields, fieldArr;
        fields = document.querySelectorAll(DOMstrings.inputDescription +','+ DOMstrings.inputValue);
        fieldArr = Array.prototype.slice.call(fields);

        fieldArr.forEach(function(cur){
            cur.value  = "";
        })

        fieldArr[0].focus();

    }
}

})();


var controller = (function(bdtCtrl,UICtrl){

    var DOM = UICtrl.getDomstrings();

    var updateBudget = function(){

       var calcBudget =  bdtCtrl.calculateBudget();
        UICtrl.displayBudget(calcBudget);

    }

    var ctrlAddItem = function(){
        var input,item;
        input = UICtrl.getInput();

        if(input.description!=="" && !isNaN(input.value)&& input.value>0){
            item = bdtCtrl.addItem(input.type,input.description,input.value);

            UICtrl.displayValues(input.type,item);
            UICtrl.clearItems();
    
            updateBudget();
            updatePercentages();
        }
        
    }

    var ctrlDeleteItem = function(event){

        var itemId,splitid, type, ID;
            itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
            splitid = itemId.split('-');
            type= splitid[0];
            ID = parseInt(splitid[1]);
            
            bdtCtrl.deleteItem(type,ID);
    
            UICtrl.deleteListItems(itemId);
    
            updateBudget();
            updatePercentages();
    }

    var updatePercentages = function(){

        var percentages;

        bdtCtrl.calculatePercentages();
        percentages = bdtCtrl.getPercentages();

        UICtrl.displayPercentages(percentages);
    }

    var setUpEventListeners = function(){

        document.querySelector(DOM.inputButton).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress',function(event){
            if(event.keyCode === 13)
            ctrlAddItem();
        });

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
    }

    return {
        init : function(){
            setUpEventListeners();
            UICtrl.displayMonth();
            UICtrl.clearItems();
            UICtrl.displayBudget({
                income : 0,
            expense : 0,
            budget : 0,
            percentage : -1
            });

        }
    }

})(budgetController,UIController);

controller.init();