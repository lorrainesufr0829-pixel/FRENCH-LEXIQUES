// ================================
// LEXIQUE STORAGE
// ================================

console.log("storage.js loaded");
const STORAGE_KEY = "lexique_vocabulary";


async function getVocabulary(){

    const { data, error } = await window.supabaseClient
        .from("vocabulary")
        .select("*")
        .order("created_at", {
            ascending: false
        });


    if(error){

        console.error(
            "Get vocabulary error:",
            error
        );

        return [];

    }


    return data || [];

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

function saveImportedVocabulary(importedWords) {

    const words = getVocabulary();

    importedWords.forEach(item => {

        item.id = Date.now() + Math.random();

        item.createdAt = new Date().toISOString();

        words.push(item);

    });

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

async function testDatabase(){

    const words = await getVocabulary();

    console.log(
        "Supabase vocabulary:",
        words
    );

}

testDatabase();