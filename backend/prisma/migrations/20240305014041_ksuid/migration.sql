DROP FUNCTION IF EXISTS ksuid() ;
CREATE FUNCTION ksuid() RETURNS  VARCHAR(27) AS $$
    DECLARE digits CHAR(62) DEFAULT '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    DECLARE n DECIMAL(49) DEFAULT EXTRACT(EPOCH FROM NOW())::INT - 1400000000; -- 8 byte time portion offset per specification.
    DECLARE f DECIMAL(49) DEFAULT 340282366920938463463374607431768211456;
    DECLARE s VARCHAR(27) ;
    DECLARE i INT DEFAULT 1;
BEGIN

  -- shift and add random bytes
  n:= n * f + (RANDOM() * f)::DECIMAL(49);

  -- base62 encode
  WHILE i <= 27 LOOP
    s:= CONCAT(SUBSTR(digits, ((n % 62) + 1)::INT, 1), s);
    n:= FLOOR(n / 62);
    i:= i + 1;
  END LOOP; 

  RETURN s;
END;
$$  LANGUAGE plpgsql VOLATILE;