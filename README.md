# json_path
JSONPath function that takes in a path to an element (or a set of elements) in a JSON structure and return that element

## Sample ussage
```
{ "store": {
    "book": [ 
      { "category": "reference",
        "author": "Nigel Rees",
        "title": "Sayings of the Century",
        "price": 8.95
      },
      { "category": "fiction",
        "author": "Evelyn Waugh",
        "title": "Sword of Honour",
        "price": 12.99
      },
      { "category": "fiction",
        "author": "Herman Melville",
        "title": "Moby Dick",
        "isbn": "0-553-21311-3",
        "price": 8.99
      },
      { "category": "fiction",
        "author": "J. R. R. Tolkien",
        "title": "The Lord of the Rings",
        "isbn": "0-395-19395-8",
        "price": 22.99
      }
    ],
    "bicycle": {
      "color": "red",
      "price": 19.95
    }
  }
}
```

| JSONPath                            | Result                                                      |
| ----------------------------------- | ----------------------------------------------------------- |
| $.store.book[\*].author             | the authors of all books in the store                       |
| $.store.*                           | all things in store, which are some books and a red bicycle |
| $.store..price                      | the price of everything in the store                        |
| $..book[2]                          | the third book                                              |
| $..book[-1:]                        | the last book in order                                      |
| $..book[0,1], $..book[:2]           | the first two books                                         |
| $..book[?(@.isbn)]                  | filter all books with isbn number                           |
| $..book[?(@.price<10)]              | filter all books cheapier than 10 (>,<,= are supported)     |
| $..book[0,1], $..book[:2]           | the first two books                                         |

