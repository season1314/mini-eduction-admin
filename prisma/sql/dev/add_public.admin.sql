INSERT INTO public."Admin" (
    "name",
    "email",
    "password",
    "permission",
    "status" ,
    "role",
     "updated_at"
) VALUES (
    'gilbert',                     
    'haoqingshuang@gmail.com',
    'gilbert',
    '{"*"}',
    'ACTIVE', 
    'SUPER', 
    NOW()  
);