const jsonPath = (pointer, objData) => {

    /* Helper functions */
    const isObject = (el) => !Array.isArray(el) && typeof el === 'object' && el !== null;
    
    // filters array elements based on the expression provided 
    const evaluateQueryExpression = (expression,dataHolder,outerKey)=>{
        const queryRegEx = /(?<=\?\(@\.)(?<key>\w+)(?:\s+)?(?<operator>(?:[<>=]|!=){1})?(?:\s+)?(?<value>\d+(?:\.\d{1,2})?|(?:.+\s?)+)?(?=\))/g;
        const queryDescriptor = [...expression.matchAll(queryRegEx)];

        // Extract capture groups
        const { key } = queryDescriptor[0].groups;
        const { operator } = queryDescriptor[0].groups;
        let { value } = queryDescriptor[0].groups;

        // Check if a calculation is required
        if(operator && value) {
            if(operator === '>') {
                return dataHolder[outerKey].filter(el=>{
                    value = isNaN(value) ? value : parseFloat(value);
                    if(isObject(el) && el[key]) return el[key] > value;
                    else return false;
                })
            }

            if(operator === '<') {
                return dataHolder[outerKey].filter(el=>{
                    value = isNaN(value) ? value : parseFloat(value);
                    if(isObject(el) && el[key]) return el[key] < value;
                    else return false;
                })
            }

            if(operator === '=') {
                return dataHolder[outerKey].filter(el=>{
                    value = isNaN(value) ? value : parseFloat(value);
                    if(isObject(el) && el[key]) return el[key] === value;
                    else return false;
                })
            }

            if(operator === '!=') {
                return dataHolder[outerKey].filter(el=>{
                    value = isNaN(value) ? value : parseFloat(value);
                    if(isObject(el) && el[key]) return el[key] !== value;
                    else return false;
                })
            }
        } else {
            // If there is no operator search for the attribute
            return dataHolder[outerKey].filter(el => el.hasOwnProperty(key));
        }
}

    const evaluatePositionExpression = (expression,dataHolder,outerKey) => {
        const positionRegEx = /(?<=:)(?<endRange>\d)|(?<range>\d,\d)|(?<startRange>\d)(?=:)/g;
        const queryDescriptor = [...expression.matchAll(positionRegEx)];

        // Extract capture groups
        const { endRange } = queryDescriptor[0].groups;
        const { range } = queryDescriptor[0].groups;
        const { startRange } = queryDescriptor[0].groups;

        // Check if a range is provided
        if(range) {
            let [first,last] = range.split(',');
            return dataHolder[outerKey].slice(first, parseInt(last) + 1);
        }

        // Check if an endRange is provided
        if(endRange) {
            return dataHolder[outerKey].filter((el,i)=> i < endRange);
        }

        // Check if a startRange is provided
        if(startRange) {
            return dataHolder[outerKey].filter((el,i)=> i >= dataHolder[outerKey].length - parseInt(startRange));
        }
    }

    /* Main function body */
    try {
        // If pointer referes to all object, return it
        if(pointer === '$') return objData;

        // Break down pointer
        const pointerRegEx = /(?<=(?<nesting>\.\.?)|^)(?<key>^\$|\w+?[^@])(?:\[(?<expression>.+?)\])?(?=\.|$)/g;
        const descriptor = [...pointer.replace('$','').matchAll(pointerRegEx)];

        // If the pointer is not formatted as expected throw an error
        if(descriptor.length === 0) throw Error(`Pointer ${pointer} improperly formatted`);

        let dataHolder = objData;

        // RegEx for matching a query within the expression
        const queryRegEx = /(?<=\?\(@\.)(?<key>\w+)(?:\s+)?(?<operator>(?:[<>=]|!=){1})?(?:\s+)?(?<value>\d+(?:\.\d{1,2})?|(?:.+\s?)+)?(?=\))/;
        // RegEx for mathing array position within expression
        const positionRegEx = /(?<=:)(?<startRange>\d)|(?<range>\d,\d)|(?<endRange>\d)(?=:)/;

        // Loop through the structure levels
        for(let i=0; i<descriptor.length; i++) {
            // Extract capture groups
            const { nesting } = descriptor[i].groups;
            const { key } = descriptor[i].groups;
            const { expression } = descriptor[i].groups;

            // Check nesting
            if(nesting === '.') {
                // Check if this level of nesting is an array
                // and contains additional extraction logic
                if(expression) {
                    if(typeof Number(expression) === 'number' && !isNaN(Number(expression))) {
                        dataHolder = dataHolder[key][expression];
                    }

                    if(expression === '*') {
                        dataHolder = dataHolder[key];
                    }
                    
                    if(queryRegEx.test(expression)) {
                        dataHolder = evaluateQueryExpression(expression, dataHolder, key);
                    }

                    if(positionRegEx.test(expression)) {
                        dataHolder = evaluatePositionExpression(expression,dataHolder,key);
                    }
                } else {
                    // If element is an array
                    if(Array.isArray(dataHolder)) {
                        let dataArr = [];
                        // If sub elements are objects, search for key in each of them
                        dataHolder.forEach(el=>{
                            if(isObject(el) && el[key]) dataArr.push(el[key]);
                        });
                        dataHolder = dataArr;
                    } else {
                        dataHolder = dataHolder[key];
                    }
                }
            } else {
                let [first] = Object.keys(dataHolder);
                // If element is an array
                if(Array.isArray(dataHolder[first])) {
                    let dataArr = [];
                    // If sub elements are objects, search for key in each of them
                    dataHolder[first].forEach(el=>{
                        if(isObject(el) && el[key]) dataArr.push(el[key]);
                    });
                    dataHolder = dataArr;
                }

                if(isObject(dataHolder[first])) {
                    if(expression) {
                        if(typeof Number(expression) === 'number' && !isNaN(Number(expression))) {
                            dataHolder = dataHolder[first][key][expression];
                        }

                        if(expression === '*') {
                            dataHolder = dataHolder[first][key];
                        }

                        if(queryRegEx.test(expression)) {
                            dataHolder = evaluateQueryExpression(expression, dataHolder[first],key)
                        }

                        if(positionRegEx.test(expression)) {
                            dataHolder = evaluatePositionExpression(expression,dataHolder[first],key)
                        }
                    } else {
                        dataHolder = dataHolder[first][key];
                    }
                }             
            }
        }
        return dataHolder;
    } catch(e) {
        console.error(e.message);
        console.error(`Pointer: ${pointer} not correct`);
    }
}
