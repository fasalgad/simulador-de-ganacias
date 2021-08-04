// CesarCuitino.cl
const notificationArea = document.querySelector("#msg"),
      posts = document.querySelector("#products"),
      loader = document.querySelector(".loader"),
      template = document.querySelector("#product-template").content,
      fragment = document.createDocumentFragment(),
      table = document.querySelector("#products-table-body"),
      total_lista = document.querySelector("#total_lista"),
      total_venta = document.querySelector("#total_venta"),
      total_ganancia = document.querySelector("#total_ganancia"),
      scrollToTopBtn = document.querySelector(".scrollToTopBtn"),
      DOMAIN = "https://teomahazlobien.com",
      SITE = `${DOMAIN}/wp-json`,
      API_WP = `${SITE}/wp/v2`,
      POSTS = `${API_WP}/producto?_embed&per_page=100`;

function numberFormat(x) { 
    x = x.toString(); 
    const pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x)) x = x.replace(pattern, "$1.$2"); 
    return x; 
}

function numberFormatToInt(x) {
    x = x.replace(/\./g,'');
    x = parseInt(x);
    return x;
}

function handleScroll() {
    const GOLDEN_RATIO = 0.1;
    const scrollableHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    if ((document.documentElement.scrollTop / scrollableHeight ) > GOLDEN_RATIO) {
        if(!scrollToTopBtn.classList.contains("showScrollBtn"))
        scrollToTopBtn.classList.add("showScrollBtn")
    } else {
        if(scrollToTopBtn.classList.contains("showScrollBtn"))
        scrollToTopBtn.classList.remove("showScrollBtn")
    }
}

function scrollToTop() {
    window.scroll({top: 0, left: 0, behavior: 'smooth'});
}

function getProducts() {
    loader.style.display = "block";
    fetch(POSTS)
    .then(res => res.ok ? res.json():Promise.reject(res))
    .then(json => {
        json.forEach(el => {
            template.querySelector(".product-title").innerHTML = el.title.rendered;
            template.querySelector(".product-price-list").innerHTML = numberFormat(el.acf.precio_lista);
            template.querySelector(".product-price-sell").innerHTML = numberFormat(el.acf.precio_venta);
            template.querySelector(".product-id").value = el.id;
            if(el.featured_media!=0) {
                template.querySelector(".product-img").src = el._embedded["wp:featuredmedia"][0].source_url;
                template.querySelector(".product-img").alt = el.title.rendered;
            } else {
                template.querySelector(".product-img").src = "default.png";
                template.querySelector(".product-img").alt = el.title.rendered;
            }
            let $clone = document.importNode(template,true);
            fragment.appendChild($clone);
        });
        posts.appendChild(fragment);
        loader.style.display = "none";
    })
    .catch(err => {
        console.log(err);
        let msg = err.statusText || "Error productos =/";
        notificationArea.innerHTML = `<p>Error ${err.status}: ${msg}</p>`;
        loader.style.display = "none";
    });
}

function addProduct(e) {
    
    const product = e.parentNode.parentNode;
    const name = product.getElementsByTagName('h4')[0].childNodes[0].nodeValue;

    let price_list = numberFormatToInt(product.getElementsByClassName('product-price-list')[0].childNodes[0].nodeValue);
    let price_sell = numberFormatToInt(product.getElementsByClassName('product-price-sell')[0].childNodes[0].nodeValue);
    let quantity = numberFormatToInt(product.getElementsByClassName('product-quantity')[0].value);
    let product_id_num = product.getElementsByClassName('product-id')[0].value;
    let subtotal = numberFormat(price_list*quantity);
    let subtotal2 = numberFormat(price_sell*quantity);

    price_list = numberFormat(price_list);
    price_sell = numberFormat(price_sell);

    let content = document.createElement("tr");
    content.setAttribute("id", product_id_num);
    content.innerHTML= `
        <td data-label="Producto" class="p_name">${name}</td>
        <td data-label="Precio lista">$<span class="p_list">${price_list}</span></td>
        <td data-label="Precio venta">$<span class="p_sell">${price_sell}</span></td>
        <td data-label="Cantidad" class="p_q"><input type="number" class="product-quantity" value="${quantity}" min="1" onchange="calcTotales(this)"></td>
        <td data-label="Subtotal lista">$<span class="p_subtotal">${subtotal}</span></td>
        <td data-label="Subtotal venta">$<span class="p_subtotal2">${subtotal2}</span></td>
        <td data-label="Acciones" class="hide"><button class="product-delete" onclick="deleteProduct(this)">Eliminar</button></td>
    `;
    table.appendChild(content);
    calcTotales(e);

}

function deleteProduct(e) {
    const product = e.parentNode.parentNode;
    product.remove();
    calcTotales(e);
}

function calcTotales(e) {

    let total_lista_num = 0;
    let total_venta_num = 0;
    let row_subtotal_lista_num = 0;
    let row_subtotal_venta_num = 0;
    let product = false;

    if (e.className == 'product-delete' || e.className == 'product-quantity') {

        product = e.parentNode.parentNode;

        const row_quantity = numberFormatToInt(product.getElementsByClassName('p_q')[0].childNodes[0].value);
        const row_price_list = numberFormatToInt(product.getElementsByClassName('p_list')[0].childNodes[0].nodeValue);
        const row_price_sell = numberFormatToInt(product.getElementsByClassName('p_sell')[0].childNodes[0].nodeValue);
        const row_subtotal_lista = product.getElementsByClassName('p_subtotal')[0].childNodes[0];
        const row_subtotal_venta = product.getElementsByClassName('p_subtotal2')[0].childNodes[0];

        row_subtotal_lista_num = row_price_list*row_quantity;
        row_subtotal_venta_num = row_price_sell*row_quantity;
        row_subtotal_lista.nodeValue = numberFormat(row_subtotal_lista_num);
        row_subtotal_venta.nodeValue = numberFormat(row_subtotal_venta_num);

    }

    const all_subtotal_lista = document.querySelectorAll('.p_subtotal');
    const all_subtotal_venta = document.querySelectorAll('.p_subtotal2');

    all_subtotal_lista.forEach(function(element,index) {
        element_value = numberFormatToInt(element.childNodes[0].nodeValue);
        total_lista_num += element_value;
    });

    all_subtotal_venta.forEach(function(element,index) {
        element_value = numberFormatToInt(element.childNodes[0].nodeValue);
        total_venta_num += element_value;
    });

    total_ganancia_num = total_venta_num - total_lista_num;

    total_lista.innerText = numberFormat(total_lista_num);
    total_venta.innerText = numberFormat(total_venta_num);
    total_ganancia.innerText = numberFormat(total_ganancia_num);

}

function cleanProducts () {
    table.innerHTML = "";
    total_lista.innerText = 0;
    total_venta.innerText = 0;
    total_ganancia.innerText = 0;
}

function createPDF() {
    const sTable = document.querySelector('#products-added').innerHTML;
    const sTotals = document.querySelector('#products-totals').innerHTML;
    const sBody = sTable + sTotals;
    const style = `<style>
    html {font-family:Calibri} 
    h1 {color:#2FB777;text-align:center;}
    table {width: 100%;font-size:16px;text-align:left;margin-bottom:30px;}
    table, th, td {border: solid 1px #DDD; border-collapse: collapse;padding:5px;}
    .th_quantity {width:60px;}
    input {border:0;width:60px;}
    p {margin:0;}
    .hide {display:none}
    </style>`;

    const win = window.open('', '', 'height=700,width=700');

    win.document.write('<html><head>');
    win.document.write('<h1>Simulación de ganancias</h1>');
    win.document.write(style);
    win.document.write('</head>');
    win.document.write('<body>');
    win.document.write(sBody);
    win.document.write('</body></html>');

    win.document.close();

    win.print();
}

document.addEventListener("DOMContentLoaded", e => {
 
    getProducts();

    document.addEventListener("scroll", handleScroll);

    scrollToTopBtn.addEventListener("click", e => {
        scrollToTop();
    });
    
});