////////////////////////////////////////////////////////////////////////////////////////BUDGET CONTROLLER
var budgetController = (function () {  // here publicTest method returns object that are public and at the same time can access private variables  due to closure property

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcpercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getpercentage = function () {
        return this.percentage;
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
        budget: 0,
        percentage: -1
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

        deleteItem: function (type, id) {

            var index, ids;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {

            //1. CALCULATE TOTAL INCOME AND EXPENSES
            calculateTotal('exp');
            calculateTotal('inc');

            //2. CALCULATE THE BUDGET : INCOME - EXPENSES 
            data.budget = data.totals.inc - data.totals.exp;

            //3. CALCULATE THE % OF INCOME THAT WE SPENT

            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1; // here we -1 is basically non existence
            }

        },

        calculatePercentages: function () {

            data.allItems.exp.forEach(function (cur) {
                cur.calcpercentage(data.totals.inc);
            });

        },

        getPercentages: function () {

            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getpercentage();
            });

            return allPerc;
        },

        getbudget: function () {
            return {
                budget: data.budget,
                totalinc: data.totals.inc,
                totalexp: data.totals.exp,
                percentage: data.percentage
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
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'

    }

    var formatNumber = function (num, type) {
        /* adding comma in thousands
           getting 2 floating points
           adding sign 
           2341.225 -> 2,341.22
        */
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        dec = numSplit[1];

        int = numSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getinput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be in inc or exp 
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);


        },

        addList: function (obj, type) {

            var html, newHtml, element;
            //Create HTML string with placeholders text

            if (type == 'inc') {

                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div> </div>'
            }
            else if (type == 'exp') {

                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div> <div class="right clearfix">  <div class="item__value">%value%</div><div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>'
            }

            //Replace the placeholders text with actual data 
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

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

        DisplayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalinc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalexp, 'exp');

            if (obj.percentage > 0) {

                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '-----';
            }

        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);


            nodeListForEach(fields, function (current, index) { //here the nodelistForeach, iterating over the list (NodeList), and calling a callback function each time. Note that this callback function takes two arguments - arr[i] (the current element), and the index of this element

                //do stuff
                if (percentages[index] > 0) {

                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = "---";
                }
            });
        },

        displayMonth: function () {

            var now, year, month;

            now = new Date();
            months = ['january', 'febuary', 'march', 'april', 'may', 'june', 'july', 'aug', 'sept', 'oct', 'nov', 'dec'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;


        },

        changedType: function () {

            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            nodeListForEach(fields,function(cur){
                cur.classList.toggle('red-focus')
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
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

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var UpdatePercentages = function () {

        //1. Update percentages
        budgetCtrl.calculatePercentages();

        //2. Read the percentages
        var percentages = budgetCtrl.getPercentages();

        //3.Update the UI with new percentages
        UICtrl.displayPercentages(percentages);
    };

    var UpdateBudget = function () {

        //1. CALCULATE THE BUDGET
        budgetCtrl.calculateBudget();

        //2.RETURN THE BUDGET
        var budget = budgetCtrl.getbudget();

        //3. UPDATE THE BUDGET IN THE UI  
        UICtrl.DisplayBudget(budget);
    };

    var CtrlAdditem = function () {

        var input, newItem;
        //1. GET THE INPUT
        input = UICtrl.getinput();
        console.log(input);

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            //2. ADD ITEM TO THE BUDGET CONTROLLER
            newItem = budgetCtrl.additem(input.type, input.description, input.value);

            //3. ADD ITEM TO THE UI
            UICtrl.addList(newItem, input.type);

            //4. Clearing the Fields
            UICtrl.clearFields();

            //5. CALCULATE AND UPDATE BUDGET
            UpdateBudget();

            //6.Calculate and Update Percentages
            UpdatePercentages();

        }

    };

    var ctrlDeleteItem = function (event) {
        //jumping to parent node(aka traversing) and then fetching id
        var itemID, spiltID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {

            //inc-1
            spiltID = itemID.split("-");
            type = spiltID[0];
            ID = parseInt(spiltID[1]);

            //1.Delete the item from data structure
            budgetCtrl.deleteItem(type, ID);

            //2.Delete the item from UI
            UICtrl.deleteListItem(itemID);

            //3.Update and show new budget
            UpdateBudget();

            //4.Calculate and Update Percentages
            UpdatePercentages();

        }
    };

    return {
        init: function () {
            SetupEventlisteners();
            UICtrl.displayMonth();
            UICtrl.DisplayBudget({
                budget: 0,
                totalinc: 0,
                totalexp: 0,
                percentage: 0,
            });
        }
    };

})(budgetController, UIcontroller);

controller.init();