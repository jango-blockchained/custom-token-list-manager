import { schema } from '@uniswap/token-lists';
import { validate } from './validateTokenList.js';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);
const validator = ajv.compile(schema);

document.getElementById('add-token-list').addEventListener('click', async () => {
  const url = prompt('Enter the URL of the token list:');
  if (url) {
    try {
      const response = await fetch(url);
      const tokenList = await response.json();
      const valid = validator(tokenList);
      if (valid) {
        loadTokenLists((tokenLists) => {
          tokenLists.push(tokenList);
          saveTokenLists(tokenLists);
        });
      } else {
        throw validator.errors;
      }
    } catch (error) {
      console.error(error);
      alert('Failed to add token list.');
    }
  }
});

function displayTokenLists(tokenLists) {
  const tokenListContainer = document.getElementById("token-list-container");
  tokenListContainer.innerHTML = "";

  for (let i = 0; i < tokenLists.length; i++) {
    const tokenList = tokenLists[i];

    const tokenListElement = document.createElement("div");
    tokenListElement.classList.add("token-list", "p-4", "bg-gray-800", "rounded", "mb-4");

    const nameElement = document.createElement("div");
    nameElement.classList.add("name");
    nameElement.textContent = tokenList.name;
    tokenListElement.appendChild(nameElement);

    const tokensElement = document.createElement("div");
    tokensElement.classList.add("tokens");

    for (let j = 0; j < tokenList.tokens.length; j++) {
      const token = tokenList.tokens[j];

      const tokenElement = document.createElement("div");
      tokenElement.classList.add("token");

      const symbolElement = document.createElement("div");
      symbolElement.classList.add("symbol");
      symbolElement.textContent = token.symbol;
      tokenElement.appendChild(symbolElement);

      const detailsElement = document.createElement("div");
      detailsElement.classList.add("details");
      detailsElement.textContent = `Name: \${token.name}, Digits: \${token.decimals}`;
      tokenElement.appendChild(detailsElement);

      tokensElement.appendChild(tokenElement);
    }

    tokenListElement.appendChild(tokensElement);

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.classList.add("btn", "btn-error");
    removeButton.addEventListener("click", () => {
      removeTokenList(i);
    });
    tokenListElement.appendChild(removeButton);

    tokenListContainer.appendChild(tokenListElement);
  }
}

function saveTokenLists(tokenLists) {
  chrome.storage.local.set({ "tokenLists": tokenLists }, function() {
    console.log("Token-List saved.");
  });
}

function loadTokenLists(callback) {
  chrome.storage.local.get(["tokenLists"], function(items) {
    callback(items.tokenLists || []);
  });
}

function addToken(tokenList, newToken) {
  const updatedTokenList = [...tokenList, newToken];
  return updatedTokenList;
}

function removeTokenList(index) {
  loadTokenLists((tokenLists) => {
    tokenLists.splice(index, 1);
    saveTokenLists(tokenLists);
  });
}

document.addEventListener("DOMContentLoaded", function() {
  loadTokenLists(function(tokenLists) {
    displayTokenLists(tokenLists);
  });
});

const addTokenButton = document.getElementById("addTokenButton");
addTokenButton.addEventListener("click", showAddTokenForm);

function processAddTokenForm(event) {
  event.preventDefault();

  const newToken = {
    symbol: document.getElementById("symbolInput").value,
    name: document.getElementById("nameInput").value,
    decimals: parseInt(document.getElementById("decimalsInput").value),
  };

  tokenLists[selectedIndex].tokens = addToken(tokenLists[selectedIndex].tokens, newToken);

  saveTokenLists(tokenLists);

  displayTokenLists(tokenLists);
}

function showAddTokenForm() {
  const form = document.createElement("form");
  form.classList.add("space-y-4");

  const symbolLabel = document.createElement("label");
  symbolLabel.textContent = "Symbol:";
  const symbolInput = document.createElement("input");
  symbolInput.type = "text";
  symbolInput.name = "symbol";
  symbolInput.id = "symbolInput";
  form.appendChild(symbolLabel);
  form.appendChild(symbolInput);

  const nameLabel = document.createElement("label");
  nameLabel.textContent = "Name:";
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.name = "name";
  nameInput.id = "nameInput";
  form.appendChild(nameLabel);
  form.appendChild(nameInput);

  const decimalsLabel = document.createElement("label");
  decimalsLabel.textContent = "Decimals:";
  const decimalsInput = document.createElement("input");
  decimalsInput.type = "number";
  decimalsInput.name = "decimals";
  decimalsInput.id = "decimalsInput";
  form.appendChild(decimalsLabel);
  form.appendChild(decimalsInput);

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.textContent = "Add Token";
  submitButton.classList.add("btn", "btn-primary"); 
  form.appendChild(submitButton);

  form.addEventListener("submit", processAddTokenForm);

  const addTokenFormContainer = document.getElementById("add-token-form-container"); 
  addTokenFormContainer.innerHTML = ""; 
  addTokenFormContainer.appendChild(form); 
}
