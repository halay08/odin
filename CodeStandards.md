# Standard Method Names
**List**
    ListBooks
    ListBookRequest
    ListBooksResponse
**Get**
    GetBook
    GetBookRequest
    GetBookResponse
**Create**
    CreateBook
    CreateBookRequest
    CreateBooKResponse
**Update**
    UpdateBook
    UpdateBookRequest
    UpdateBookResponse
**Delete**
    DeleteBook
    DeleteBookRequest
    DeleteBookResponse
    
   
# Custom Methods
Cancel
BatchGet
Move
Search
Undelete


# Resource Names
storage.companyapis.com/buckets/bucket-id/objects/object-id

# Relative resource names
shelves/shelf-id/books/book-id


# Controller method arguments

## To use overloaded functions in TypeScript we adopt a naming convention. 



## Argument order matters
methodName(Princpal, Params, Query, Body, Response)

Method name based on params 

getByPrincipalAndParamOneAndQueryOne(Princpal, ParamOne, QueryOne, Response)

getByPrincipalAndParamOneAndParamTwoQueryOne(Princpal, ParamOne, ParamTwo QueryOne, Response)

getByPrincipalAndParamOneAndParamTwoQueryOne(Princpal, ParamOne, ParamTwo QueryOne, Response)


# Error Handling

## Error handling in the service layer
We need to add controller method decorators for error response statusCodes







 


