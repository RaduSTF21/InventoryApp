<?php
ini_set("display_errors",1);
error_reporting(E_ALL);

require_once __DIR__.'/../bootstrap.php';
require_once __DIR__.'/../config/db.php';

include __DIR__.'/templates/add_product_form.html';
