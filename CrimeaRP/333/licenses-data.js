// Дані виданих ліцензій. Кожен запис має: тип ліцензії, нік гравця, термін дії.
// Щоб додати нову ліцензію - скопіюй шаблон і заповни дані.

const licensesData = [

  // один з: advocate, taxi, weapon-storage, weapon-carry
  // ШАБЛОН (скопіюй цей блок і заповни своїми даними):
  // {
//{
  //number: "0000",
  //type: "advocate",
  //nick: "",
  //validFrom: "",
  //validTo: ""
//},
  // },

   {
     number: "03785",
     type: "weapon-storage",           
     nick: "Yezh1lya",
     validFrom: "20.07.2026",
     validTo: "Нескінченно"
   },

   {
     number: "03926",
     type: "weapon-carry",           
     nick: "Yezh1lya",
     validFrom: "20.07.2026",
     validTo: "Нескінченно"
   },
   {
     number: "1843",
     type: "taxi",           
     nick: "Matviy105012",
     validFrom: "20.07.2026",
     validTo: "Нескінченно"
   },

];

// Назви типів ліцензій для показу на сайті
const licenseTypeNames = {
  "advocate": "Ліцензія адвоката",
  "taxi": "Ліцензія таксиста",
  "weapon-storage": "Ліцензія на зброю (зберігання)",
  "weapon-carry": "Ліцензія на приховане носіння зброї"
};