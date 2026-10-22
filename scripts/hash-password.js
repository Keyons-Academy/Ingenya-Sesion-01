import{randomBytes,scryptSync}from'node:crypto';
const password=process.argv[2];if(!password||password.length<14){console.error('Uso: npm run hash-password -- "una-clave-segura-de-14-caracteres-o-mas"');process.exit(1);}
const salt=randomBytes(24).toString('hex');console.log(`ADMIN_PASSWORD_HASH=${salt}:${scryptSync(password,salt,64).toString('hex')}`);
