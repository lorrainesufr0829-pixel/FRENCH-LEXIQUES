// =====================================
// LEXIQUE VOCABULARY IMPORT
// =====================================


// ================================
// Excel Import
// ================================

const vocabularyFileInput =
    document.getElementById("file-upload");


if (vocabularyFileInput) {


    vocabularyFileInput.addEventListener(
        "change",
        function(event){


            const file =
                event.target.files[0];


            if(!file){

                return;

            }


            if(typeof XLSX === "undefined"){

                alert(
                    "Excel import library is not loaded."
                );

                return;

            }


            const reader =
                new FileReader();



            reader.onload = async function(e){


                const data =
                    new Uint8Array(
                        e.target.result
                    );


                const workbook =
                    XLSX.read(
                        data,
                        {
                            type:"array"
                        }
                    );


                const sheet =
                    workbook.Sheets[
                        workbook.SheetNames[0]
                    ];


                const rows =
                    XLSX.utils.sheet_to_json(
                        sheet
                    );



                if(rows.length === 0){

                    alert(
                        "No vocabulary found."
                    );

                    return;

                }



                const importedWords =
                    rows.map(function(item){


                        return {


                            word:
                                item.Word ||
                                item.word ||
                                "",


                            meaning:
                                item.Meaning ||
                                item.meaning ||
                                "",


                            category:
                                item.Category ||
                                item.category ||
                                "",


                            level:
                                item.Level ||
                                item.level ||
                                ""

                        };


                    });



                const success =
                    await saveImportedVocabulary(
                        importedWords
                    );



                if(success){


                    alert(
                        importedWords.length +
                        " words imported successfully!"
                    );


                }



            };


            reader.readAsArrayBuffer(file);


        }
    );

}



// ================================
// Manual Add Vocabulary
// ================================


const addButton =
    document.getElementById(
        "add-word-btn"
    );


if(addButton){


    addButton.addEventListener(
        "click",
        async function(){


            const word =
                document.getElementById(
                    "new-word"
                ).value.trim();



            const meaning =
                document.getElementById(
                    "new-meaning"
                ).value.trim();



            const category =
                document.getElementById(
                    "new-category"
                ).value;



            const level =
                document.getElementById(
                    "new-level"
                ).value;



            if(!word || !meaning){

                alert(
                    "Please enter word and meaning."
                );

                return;

            }



            const success =
                await saveImportedVocabulary([

                    {

                        word: word,

                        meaning: meaning,

                        category: category,

                        level: level

                    }

                ]);



            if(success){


                alert(
                    "Vocabulary added successfully!"
                );


                document.getElementById(
                    "new-word"
                ).value = "";


                document.getElementById(
                    "new-meaning"
                ).value = "";


            }



        }
    );


}
// ===============================
// Load Library
// ===============================

async function loadLibrary() {

    const words = await getVocabulary();

    const wordList = document.getElementById("word-list");
    const wordCount = document.getElementById("word-count");

    if (!wordList) return;

    wordList.innerHTML = "";
    wordCount.textContent = `${words.length} Words`;

    words.forEach(word => {

        const card = document.createElement("div");
        card.className = "word-card";

        card.innerHTML = `
            <h3>${word.word || ""}</h3>
            <p>${word.meaning || ""}</p>
        `;

        wordList.appendChild(card);

    });

}

if (document.getElementById("word-list")) {
    loadLibrary();
}