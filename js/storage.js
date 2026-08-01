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

async function saveImportedVocabulary(words){

    const { data, error } = await window.supabaseClient
        .from("vocabulary")
        .insert(words);


    if(error){

        console.error(
            "Import error:",
            error
        );

        alert("Import failed");

        return false;

    }


    return true;

}

