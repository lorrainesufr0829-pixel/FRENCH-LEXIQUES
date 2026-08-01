// ================================
// LEXIQUE STORAGE
// ================================


const STORAGE_KEY = "lexique_vocabulary";





function getVocabulary(){


    const data = localStorage.getItem(STORAGE_KEY);


    if(!data){

        return [];

    }


    return JSON.parse(data);


}






function saveVocabulary(words){


    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(words)

    );


}






function addVocabulary(word){


    const words = getVocabulary();


    word.id = Date.now();


    word.createdAt = new Date()
    .toISOString();



    words.push(word);


    saveVocabulary(words);



}

function saveImportedVocabulary(newWords){


const oldWords =
getVocabulary();



const merged =
[
...oldWords,
...newWords
];



saveVocabulary(merged);


}