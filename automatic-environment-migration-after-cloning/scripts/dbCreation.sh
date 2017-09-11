#!/bin/bash

mysql -uroot -p$1 << END 
    CREATE DATABASE alfresco;
    GRANT USAGE ON *.* TO alfresco@localhost  identified by 'password';
    grant all privileges on alfresco.* to alfresco@localhost;
    use alfresco;
END
