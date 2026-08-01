// =================================
// LEXIQUE Vocabulary Management
// =================================


// =================================
// 1. Manual Add Vocabulary
// =================================


const addButton = document.getElementById(
    "add-word-btn"
);


if (addButton) {


    addButton.addEventListener(
        "click",
        function () {


            const wordInput =
                document.getElementById("new-word");


            const meaningInput =
                document.getElementById("new-meaning");


            const categoryInput =
                document.getElementById("new-category");


            const levelInput =
                document.getElementById("new-level");



            const word =
                wordInput.value.trim();


            const meaning =
                meaningInput.value.trim();


            const category =
                categoryInput.value;


            const level =
                levelInput.value;



            if (!word || !meaning) {


                alert(
                    "Please complete word and meaning."
                );


                return;

            }





            addVocabulary({


                word: word,


                meaning: meaning,


                category: category,


                level: level


            });





            alert(
                "Vocabulary added successfully!"
            );



            // clear input

            wordInput.value = "";

            meaningInput.value = "";

            categoryInput.value = "";

            levelInput.value = "";



        }

    );


}









// =================================
// 2. Excel / CSV Import
// =================================



const vocabularyFileInput =
    document.getElementById(
        "file-upload"
    );



if (vocabularyFileInput) {


    vocabularyFileInput.addEventListener(

        "change",

        function(event){



            const file =
                event.target.files[0];



            if (!file) {

                return;

            }




            // Check SheetJS

            if (typeof XLSX === "undefined") {


                alert(
                    "Excel import library is not loaded."
                );


                return;

            }





            const reader =
                new FileReader();





            reader.onload = function(e){



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
rows.map(
function(item){


return {


word:
item.Word ||
item.word ||
item.French ||
item.Vocabulary ||
"",



meaning:
item.Meaning ||
item.meaning ||
item.Translation ||
item.Chinese ||
"",



category:"",

level:""


};



});






              saveImportedVocabulary(
    importedWords
).then(function(){

    alert(
        importedWords.length
        +
        " words imported successfully!"
    );

});


            };





            reader.readAsArrayBuffer(file);



        }


    );


}









// =================================
// 3. Library Display
// =================================



const wordList =
    document.getElementById(
        "word-list"
    );



if(wordList){



    const words =
        getVocabulary();




    const count =
        document.getElementById(
            "word-count"
        );



    if(count){


        count.innerText =
            `${words.length} Words`;


    }






    words.forEach(

        function(item){



            const row =
                document.createElement(
                    "article"
                );



            row.className =
                "word-row";





            row.innerHTML = `


                <div class="word-info">


                    <h3>
                    ${item.word}
                    </h3>


                    <p>
                    ${item.meaning}
                    </p>


                </div>




                <div class="word-tag">


                    <span>
                    ${item.level || ""}
                    </span>


                    <span>
                    ${item.category || ""}
                    </span>


                </div>


            `;




            wordList.appendChild(row);



        }


    );



}