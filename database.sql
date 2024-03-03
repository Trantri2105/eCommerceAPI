CREATE TABLE users(
	id SERIAL PRIMARY KEY,
	firstname VARCHAR(50),
	lastname VARCHAR(50),
	email VARCHAR(50) NOT NULL UNIQUE,
	password VARCHAR(100) NOT NULL,
	isadmin BOOLEAN DEFAULT(FALSE)
);
CREATE TABLE categories(
	id SERIAL PRIMARY KEY,
	title VARCHAR(100),
	description VARCHAR(100),
	img TEXT
);

CREATE TABLE products(
	id SERIAL PRIMARY KEY,
	title VARCHAR(50),
	description TEXT,
	img TEXT,
	category_id INT REFERENCES categories(id),
	price INT,
	date_created DATE DEFAULT CURRENT_DATE,
	stocks INT
);

CREATE TABLE colors(
	id SERIAL PRIMARY KEY,
	product_id INT REFERENCES products(id),
	color VARCHAR(50)
);

CREATE TABLE sizes(
	id SERIAL PRIMARY KEY,
	product_id INT REFERENCES products(id),
	size VARCHAR(50)
);

CREATE TABLE cart_items(
	user_id INT REFERENCES users(id),
	product_id INT REFERENCES products(id),
	quantity INT,
	color VARCHAR(50),
	size VARCHAR(50),
	PRIMARY KEY (user_id, product_id)
);

CREATE TABLE orders(
	id SERIAL PRIMARY KEY,
	user_id INT REFERENCES users(id),
	total_cost INT,
	address TEXT,
	order_date DATE DEFAULT CURRENT_DATE,
	status TEXT DEFAULT ('pending')
);

CREATE TABLE order_detail(
	id SERIAL PRIMARY KEY,
	order_id INT REFERENCES orders(id),
	product_id INT REFERENCES products(id),
	color VARCHAR(50),
	size VARCHAR(50),
	quantity INT
);
