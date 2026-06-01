// Top-level app: route state + product catalog backed by real photos.

const PHOTOS = '../../assets/photos/';
const DAHILA_PRODUCTS = [
  { id: 'p1', name: 'Top Lourdes',          price: 'UYU 3.450', badge: 'Nuevo',
    photo: PHOTOS + 'top-lace-parque.png',     category: 'tops',
    description: 'Tejido en algodón pima blanco con detalle floral. Edición a medida. Tiempo de tejido: 4–6 semanas.' },
  { id: 'p2', name: 'Bolero Pétalo',         price: 'UYU 4.890', badge: 'A medida',
    photo: PHOTOS + 'bolero-marron.png',       category: 'cardigans',
    description: 'Cropped bolero en hilo con sparkle, mangas anchas. Va sobre cualquier vestido para cambiar el día.' },
  { id: 'p3', name: 'Top Blanco Sol',        price: 'UYU 3.890', badge: 'Nuevo',
    photo: PHOTOS + 'top-blanco.png',          category: 'tops',
    description: 'Top off-shoulder en algodón natural. Caída suave, tres cuartos de manga.' },
  { id: 'p4', name: 'Wrap Negro',            price: 'UYU 5.200', badge: 'A medida',
    photo: PHOTOS + 'wrap-negro.png',          category: 'tops',
    description: 'Hombro descubierto en lana mohair negra. Una sola pieza, sin costuras laterales.' },
  { id: 'p5', name: 'Chaleco Avellana',      price: 'UYU 5.450', badge: null,
    photo: PHOTOS + 'chaleco-marron.jpg',      category: 'cardigans',
    description: 'Chaleco a botones con borde marrón profundo. Algodón natural sin teñir.' },
  { id: 'p6', name: 'Bufanda Verena',        price: 'UYU 1.890', badge: 'Nuevo',
    photo: PHOTOS + 'bufanda-verde.png',       category: 'accesorios',
    description: 'Bufanda larga en verde musgo con rayas crema. 180 cm de largo.' },
  { id: 'p7', name: 'Bufanda Frutilla',      price: 'UYU 1.890', badge: null,
    photo: PHOTOS + 'bufanda-rosa.jpg',        category: 'accesorios',
    description: 'Patchwork de rosa y rojo, terminación en franja. 165 cm.' },
  { id: 'p8', name: 'Bolso Manzana',         price: 'UYU 2.450', badge: null,
    photo: PHOTOS + 'bolsos-rojo-negro.jpg',   category: 'accesorios',
    description: 'Bolso de hilo grueso, asa redonda. Disponible en rojo y negro.' },
  { id: 'p9', name: 'Set Cobre',             price: 'UYU 7.890', badge: 'Edición limitada',
    photo: PHOTOS + 'set-marron.jpg',          category: 'sets',
    description: 'Top + falda en hilo cobre con lurex. Combinable o por separado.' },
];

function App() {
  const [route, setRoute] = React.useState('home');
  const [productId, setProductId] = React.useState('p1');
  const [cartCount, setCartCount] = React.useState(0);

  const navigate = (r, id) => {
    setRoute(r);
    if (id) setProductId(id);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const product = DAHILA_PRODUCTS.find((p) => p.id === productId) || DAHILA_PRODUCTS[0];

  let screen = null;
  if (route === 'home')      screen = <HomeScreen onNavigate={navigate} products={DAHILA_PRODUCTS}/>;
  if (route === 'tienda')    screen = <TiendaScreen onNavigate={navigate} products={DAHILA_PRODUCTS}/>;
  if (route === 'producto')  screen = <ProductoScreen product={product} onAddToCart={() => setCartCount(c => c + 1)} onNavigate={navigate}/>;
  if (route === 'encargo')   screen = <EncargoScreen onNavigate={navigate}/>;
  if (route === 'atelier')   screen = <AtelierScreen/>;
  if (route === 'contacto')  screen = <ContactoScreen/>;

  return (
    <div data-screen-label={route}>
      <Header route={route} onNavigate={navigate} cartCount={cartCount}/>
      {screen}
      <Footer/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
