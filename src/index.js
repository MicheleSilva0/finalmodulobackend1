import { randomUUID } from 'node:crypto';


//pega bliblioteca do 'express' e importa a funcionalidade chamada express
import express, { request, response } from 'express';
import express from 'express';



//importação do bcrypt para criar senhas com caracteres aleatórios
//comando para instalar yarn add bcrypt
import bcrypt from "bcrypt";


//biblioteca para criar token e deixar o usuario logado mais tempo
import jwt from "jsonwebtoken";
import { log } from 'node:console';


//o express usado acima é para criar uma aplicação, criar um servidor no back-end
const app = express();


//app.user é para aceitar requisições com json
app.use(express.json());
const verifyJwt = function (req, res, next) {
    const body = req.body;
    jwt.verify(body.accessToken, "growdev", (err, idUsuario) => {
        if (err) {
            return res.status(403).json("Access token invalido");
        }
        req.user = idUsuario;
        next();
    });
};


const usuarios = [
    {
        id: randomUUID(),
        nome: "Mihcele",
        email: "michele@Silva",
        senha: "$2a$06$oWaGUzjgm8wGpV8otyteyuuiLM3blA6ul2q.X3X6df33zLStZBwXK",
        recados: [
            {
                id: randomUUID(),
                titulo: "exercicios",
                descricao: "correr no parque"
            }
        ]
    },


    {
        id: randomUUID(),
        nome: "Carol Silva",
        email: "carol@silva",
        senha: "$2a$06$6aRs1GjmDyjTFUPzJWqx7OohIj74m4KNOhMoCE9LjLp6e/.BZgJOe",
        recados: [
            {
                id: randomUUID(),
                titulo: "aula ",
                descricao: "segunda a quarta 20:30"
            }
        ]
    },


    {
        id: randomUUID(),
        nome: "Jane Candido",
        email: "jane@silva",
        senha: "$2a$06$fyo17xUNtk0eHJt4ehjdku6a7DQpn.HChRhQfneBHMdH9XbvW75ha",
        recados: [
            {
                id: randomUUID(),
                titulo: "farmacia",
                descricao: "comprar remedio todo dia 07 do mes"
            }
        ]
    }
]


//configuro a rota; '/' é a mesma coisa que http://api.com, é como se fosse a roda principal da api
//request contem informações da requisição que o front-end faz pro back-end
//response contem informações da resposta que o back-end faz pro front-end 


app.get('/', (request, response) => {
    return response.json('OK');
});


//EXIBE USUARIOS E SEUS RECADOS
//essa rota eu sei que teria que por verificação de acesso, mas para testar todos os usuarios eu deixei ela sem verificação de autenticidade
app.get('/usuario', (request, response) => {
    return response.json(usuarios)
})


//BUSCA USUARIOS E SEUS RECADOS PELO ID DO USUARIO


app.get('/usuario/:id/recados/', (request, response) => {
    const params = request.params.id
    const pegaUsuariosPeloIndice = usuarios.findIndex((usuario) => {
        return usuario.id == params
    })
    if (pegaUsuariosPeloIndice === -1) {
        return response.status(400).json("Usuario não encontrado")
    }
    return response.json(usuarios[pegaUsuariosPeloIndice]);
})


//CRIAR RECADO


app.post('/usuario/recados/', verifyJwt, (request, response) => {
    const body = request.body
    const idAutenticado = request.user.usuarioId
    const pegaIndice = usuarios.findIndex(usuario => {
        return idAutenticado === usuario.id
    })
    if (pegaIndice === -1) {
        return response.status(401).json("Usuário não autenticado")
    }
    
    if (!body.titulo) {
        return response.status(400).json("Titulo não informado!")
    }
    if (!body.descricao) {
        return response.status(400).json("Descrição não informada!")
    }
    const recado = {
        id: randomUUID(),
        titulo: body.titulo,
        descricao: body.descricao
    }
    usuarios[pegaIndice].recados.push(recado)
    return response.status(201).json("Recado criado com sucesso")
})


//ATUALIZA RECADOS


app.put('/usuario/recados/:idRecado', verifyJwt, (request, response) => {
    const body = request.body


    //pega os dados que voltar do midlleware


    const idAutenticado = request.user.usuarioId
    const idRecados = request.params.idRecado
    const pegaIndiceUsuario = usuarios.findIndex(usuario => {
        return usuario.id == idAutenticado
    })
    if (pegaIndiceUsuario === -1) {
        return response.status(401).json("Usuário não autenticado")
    }
    const pegaIndiceRecado = usuarios[pegaIndiceUsuario].recados.findIndex(recado => {
        return recado.id === idRecados
    })
    if (pegaIndiceRecado === -1) {
        return response.status(400).json("Recado inválido")
    }
    const recado = {
        id: idRecados,
        titulo: body.titulo,
        descricao: body.descricao
    }
    usuarios[pegaIndiceUsuario].recados[pegaIndiceRecado] = recado
    return response.status(201).json("Recado atualizado com sucesso!!")
})


//DELETA RECADO
app.delete('/usuario/recados/:idRecado', verifyJwt, (request, response) => {
    const idAutenticado = request.user.usuarioId
    const idRecado = request.params.idRecado
    const pegaIndiceUsuario = usuarios.findIndex(usuario => {
        return usuario.id == idAutenticado
    })
    if (pegaIndiceUsuario === -1) {
        return response.status(401).json("Usuário não autenticado")
    }
    const pegaIndiceRecado = usuarios[pegaIndiceUsuario].recados.findIndex(recado => {
        return recado.id === idRecado
    })
    if (pegaIndiceRecado === -1) {
        return response.status(400).json("Recado inválido")
    }
    const recadosUsuario = usuarios[pegaIndiceUsuario].recados
    recadosUsuario.splice(pegaIndiceRecado, 1)
   
    return response.json("Recado deletado com sucesso!!")
})


//CRIA USUARIO
//async usa porque estamos usando await que é para esperar ate o bcrypt gerar a senha
app.post('/usuario', async (request, response) => {
    const body = request.body
    if (!body.nome) {
        return response.status(400).json("Nome não informado!")
    }
    if (!body.email) {
        return response.status(400).json("E-mail não informado!")
    }
    if (!body.senha) {
        return response.status(400).json("Senha não informada!")
    }
    const existeEmail = usuarios.find(usuario => {
        return usuario.email === body.email
    })
    if (existeEmail != undefined) {
        return response.json("E-mail já cadastrado!!")
    }


    //transforma a senha que vem no corpo da requisição em sequencia de caracteres
    //o numero 6 indica a quantidade de rounds


    const hashedSenha = await bcrypt.hash(body.senha, 6)
    const usuario = {
        id: randomUUID(),
        nome: body.nome,
        email: body.email,
        senha: hashedSenha,
        recados: []
    }
    usuarios.push(usuario)
    return response.json("Usuario cadastrado com sucesso!!")
})


//LOGIN USUARIO


app.post('/usuario/login', async (request, response) => {
    const body = request.body
    if (body.email == undefined) {
        return response.status(400).json("E-mail não informado!")
    }
    if (body.senha == undefined) {
        return response.status(400).json("Senha não informada!")
    }
    const existeEmail = usuarios.find(usuario => {
        return usuario.email === body.email
    })
    if (existeEmail === undefined) {
        return response.status(401).json("Credenciais invalidas!")
    }


    //compara se a senha passada pelo usuario e igual a senha cadastrada usando a funcao compare


    const hashedSenha = await bcrypt.compare(body.senha, existeEmail.senha)
    if (hashedSenha === false) {
        return response.status(401).json("Credenciais invalidas!")
    }

    const accessToken = jwt.sign({ usuarioId: existeEmail.id },
        "growdev", { expiresIn: "1800s", }
    );

    //se der tudo certo na validacão 
    return response.status(201).json({
        accessToken,
    });
})

//listem quer dizer o que servidor vai estar ouvindo requisições, esperando, na porta 8080,
//e quando ele comecar a ouvir requisições ele vai dar uma mensagem de servidor iniciado
app.listen(8080, () => console.log("Servidor iniciado"));