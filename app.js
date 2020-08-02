////////////////////////////////////////////////////////////////////////////////////////BUDGET CONTROLLER
var budgetController = (function () {  // here publicTest method returns object that are public and at the same time can access private variables  due to closure property

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };


    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum = sum + cur.value;
        });

        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: [],
            inc: []
        },
        budget : 0,
        percentage : -1 
    };


    return {
        additem: function (type, des, val) {
            var newItem, ID;
            ID = 0;

            if (data.allItems[type].length > 0) {
                //Create new ID,selecting the last id and incremeanting it for next id
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;                // access obj in arr by using '.'
            }
            else {
                ID = 0;
            }


            //Create new item based on 'exp' or 'inc'
            if (type == 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type == 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push it into allItems
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },

        calculateBudget : function () {

            //1. CALCULATE TOTAL INCOME AND EXPENSES
            calculateTotal('exp');
            calculateTotal('inc');

            //2. CALCULATE THE BUDGET : INCOME - EXPENSES 
            data.budget = data.totals.inc - data.totals.exp ;

            //3. CALCULATE THE % OF INCOME THAT WE SPENT

            if(data.totals.inc > 0){
                data.percentage =Math.round( (data.totals.exp / data.totals.inc) * 100) ;
            } else {
                data.percentage = -1; // here we -1 is basically non existence
            }
           
        },

        getbudget : function(){
            return {
                budget : data.budget ,
                totalinc : data.totals.inc,
                totalexp : data.totals.exp,
                percentage : data.percentage
            };
        },

        testing: function () {
            console.log(data);
        }
    };

})();



////////////////////////////////////////////////////////////////////////////////////////////////////////  UI CONTROLLER
var UIcontroller = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expensesLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage'

    }

    return {
        getinput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be in inc or exp 
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addList: function (obj, type) {

            var html, newHtml, element;
            //Create HTML string with placeholders text

            if (type == 'inc') {

                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div> </div>'
            }
            else if (type == 'exp') {

                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div> <div class="right clearfix">  <div class="item__value">%value%</div><div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>'
            }

            //Replace the placeholders text with actual data 
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", obj.value);

            //Insert the HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        clearFields: function () {
            var fields;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            //here jona converted the Nodelist to array and then sliced&call it, whereas now in the updated version we can do it without the conversion
            fields.forEach(function (current, index, array) {
                current.value = '';
            });
            fields[0].focus();
        },

         DisplayBudget : function (obj){

            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget ;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalinc ;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalexp ;

            if ( obj.percentage > 0 ){

                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%" ;
            } else { 
              document.querySelector(DOMstrings.percentageLabel).textContent = '-----' ;
            }
        
         },

        getDOmstrings: function () {
            return DOMstrings;
        }
    }

})();

//////////////////////////////////////////////////////////////////////////////////////////////  GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    var SetupEventlisteners = function () {

        var DOM = UIcontroller.getDOmstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', CtrlAdditem);

        document.addEventListener('keypress', function (event) {

            if (event.keyCode == 13 || event.which == 13) {   // older browsers used which instead of keycode
                CtrlAdditem();
            }
        });

    };

    var UpdateBudget = function () {

        //1. CALCULATE THE BUDGET
        budgetController.calculateBudget();

        //2.RETURN THE BUDGET
        var budget = budgetController.getbudget();

        //3. UPDATE THE BUDGET IN THE UI  
        UIcontroller.DisplayBudget(budget);
    };

    var CtrlAdditem = function () {

        var input, newItem;
        //1. GET THE INPUT
        input = UIcontroller.getinput();
        console.log(input);

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            //2. ADD ITEM TO THE BUDGET CONTROLLER
            newItem = budgetController.additem(input.type, input.description, input.value);
            //3. ADD ITEM TO THE UI
            UIcontroller.addList(newItem, input.type);

            //4. Clearing the Fields
            UIcontroller.clearFields();

            //5. CALCULATE AND UPDATE BUDGET
            UpdateBudget();
        }

    };

    return {
        init: function () {
            SetupEventlisteners();
        }
    };

})(budgetController, UIcontroller);

controller.init();