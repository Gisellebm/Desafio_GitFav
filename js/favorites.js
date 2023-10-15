import { GithubUser } from "./GithubUser.js";

// Classe que vai conter a lógica dos dados

export class favorites {
    constructor(root) {
        this.root = document.querySelector(root);
        this.divEmpty = this.root.querySelector('div .empty-state');
        this.load();
    }
    
    load() {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || [];
    }

    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries));
    }

    async add(username) {
        try {
            const userExists = this.entries.find(entry => entry.login === username);

            if(userExists) {
                throw new Error('Usuário já cadastrado!'); 
            }


            const user = await GithubUser.search(username);
            if(user.login === undefined) {
                throw new Error('Usuário não encontrado!')
            }

            this.entries = [user, ...this.entries];
            this.update();
            this.save();

        } catch(error) {
            alert(error.message);
        }
    }

    delete(user) {
        this.entries = this.entries.filter(entry => entry.login !== user.login);

        this.update();
        this.save();
        this.emptyState();
    }
}

//classe que vai criar a visualização e controlar os dados
export class favoritesView extends favorites {
    constructor(root) {
        super(root);

        this.tbody = this.root.querySelector('table tbody');
        
        this.update();
        this.onadd();
    }

    onadd() {
        const addButton = this.root.querySelector('.search button');
        addButton.onclick = () => {
            const input = this.root.querySelector('.search input');
            this.add(input.value);
            input.value = '';
        }
    }

    update() {
        this.removeAllTr();


        this.entries.forEach( user => {
            const row = this.createRow();
            
            row.querySelector('.user img').src = `https://github.com/${user.login}.png`;
            row.querySelector('.user img').alt = `Imagem de ${user.name}`
            row.querySelector('.user a').href = `https://github.com/${user.login}`;
            row.querySelector('.user p').textContent = user.name;
            row.querySelector('.user span').textContent = user.login;
            row.querySelector('.repositories').textContent = user.public_repos;
            row.querySelector('.followers').textContent = user.followers;
            row.querySelector('.remove').onclick = () => { //como só vou usar um único evento neste botão, vou usar o 'onclick'
                const isOk = confirm(`Deseja realmente excluir ${user.name}?`); 
                if(isOk) {
                    this.delete(user)
                }
            }

            this.tbody.append(row);
            this.emptyState();
        })
    }

    emptyState() {
        if (this.entries.lenght === 0) {
            this.divEmpty.classList.remove('hidden');
            console.log(this.divEmpty);
        } else {
            this.divEmpty.classList.add('hidden');
            console.log(this.divEmpty);
        }
    }
    
    createRow () {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td class="user">
                <img src="https://github.com/user.login.png" alt="user.name">
                <a href="https://github.com/user.login" target="_blank">
                    <p>user.name</p>
                    <span>user.login</span>
                </a>
            </td>
            <td class="repositories">00</td>
            <td class="followers">00</td>
            <td>
                <button class="remove">Remover</button>
            </td>  
        `


        return tr
    }
    
    removeAllTr() {       
        this.tbody.querySelectorAll('tr').forEach((tr) => {
           tr.remove() 
        })       
    }
}