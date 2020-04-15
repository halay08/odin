````

ts-node import-exec.ts init=exchanges name='Peterlee Exchange' l0id=144 programid='1309266a-46ff-4f70-8d7c-3d926491bc0c' exmtid='73a762f3-6882-47cb-8e6c-3963cca03f4a'

ts-node import-exec.ts init=projects name='Peterlee East' l0id=143 programid='1309266a-46ff-4f70-8d7c-3d926491bc0c' planmtid='3f42c07c-dc5c-4a49-a254-6425ccadae06'
ts-node import-exec.ts init=projects name='Peterlee North' l0id=144 programid='1309266a-46ff-4f70-8d7c-3d926491bc0c' planmtid='3f42c07c-dc5c-4a49-a254-6425ccadae06'
ts-node import-exec.ts init=projects name='Peterlee South' l0id=145 programid='1309266a-46ff-4f70-8d7c-3d926491bc0c' planmtid='3f42c07c-dc5c-4a49-a254-6425ccadae06'
ts-node import-exec.ts init=projects name='Peterlee West' l0id=146 programid='1309266a-46ff-4f70-8d7c-3d926491bc0c' planmtid='3f42c07c-dc5c-4a49-a254-6425ccadae06'

ts-node import-exec.ts init=tasks l0id=143
ts-node import-exec.ts init=tasks l0id=144
ts-node import-exec.ts init=tasks l0id=145
ts-node import-exec.ts init=tasks l0id=146

# Import L0 Features
ts-node import-exec.ts init=features l0id=144 isl0=true

ts-node import-exec.ts init=features l0id=143
ts-node import-exec.ts init=features l0id=144
ts-node import-exec.ts init=features l0id=145
ts-node import-exec.ts init=features l0id=146

ts-node import-exec.ts init=products l0id=144 isl0=true

ts-node import-exec.ts init=products l0id=143
ts-node import-exec.ts init=products l0id=144
ts-node import-exec.ts init=products l0id=145
ts-node import-exec.ts init=products l0id=146

# Import data for a single polygonId
ts-node import-exec.ts init=tasks polygonId=6366
ts-node import-exec.ts init=features polygonId=6366
ts-node import-exec.ts init=products polygonId=6366

````
