import { Link } from 'react-router-dom'

export type PolicyType = 'shipping' | 'returns' | 'privacy' | 'terms'

function ContactLine() {
  return <p>Questions about an order or this page? <Link to="/contact">Contact the showroom</Link>.</p>
}

export function PolicyContent({ type }: { type: PolicyType }) {
  if (type === 'shipping') return (
    <div className="policy-content">
      <p>Delivery is arranged for each order after the product, destination and service requirements have been confirmed. Browsing the collection or adding a piece to an inquiry list does not place an order.</p>
      <section>
        <h2>Before an order is confirmed</h2>
        <p>Ask the showroom about availability, the delivery address, building access and any assembly or placement needs. The written quotation or order confirmation should state the agreed delivery area, service, cost and expected timing.</p>
      </section>
      <section>
        <h2>Delivery and inspection</h2>
        <p>The team will coordinate the delivery method and any special handling with you. Please inspect the items when they arrive and tell the team promptly if an item appears damaged, incomplete or different from the confirmed order. Keep the packaging and photographs where possible while the issue is reviewed.</p>
      </section>
      <section>
        <h2>Changes or delays</h2>
        <p>If the address, access arrangements or requested date changes, contact the showroom as soon as possible. Any revised timing or additional cost should be confirmed before delivery proceeds.</p>
      </section>
      <ContactLine />
    </div>
  )

  if (type === 'returns') return (
    <div className="policy-content">
      <p>Furniture and interior pieces may be selected with particular sizes, materials or finishes. The applicable cancellation, return and remedy terms should be stated in the written quotation or order confirmation before you agree to an order.</p>
      <section>
        <h2>Before confirming a custom order</h2>
        <p>Check the product name, dimensions, finish, quantity, delivery details and any agreed customisation. Tell the showroom about a mistake or requested change before production or delivery is arranged. The team will explain whether a change is possible and confirm any effect on cost or timing.</p>
      </section>
      <section>
        <h2>If there is a problem</h2>
        <p>Contact the showroom promptly if a delivered item is damaged, incomplete or does not match the confirmed order. Include the order details and photographs where available, and keep the item and packaging while the team reviews the issue. The appropriate repair, replacement, return or other resolution will depend on the circumstances, the agreed order terms and applicable law.</p>
      </section>
      <section>
        <h2>Changing your mind</h2>
        <p>Do not assume that the same return conditions apply to every piece, especially one made or finished to your specifications. Ask for the applicable terms in writing before confirming an order. Nothing on this page removes any rights you have under applicable law.</p>
      </section>
      <ContactLine />
    </div>
  )

  if (type === 'privacy') return (
    <div className="policy-content">
      <p>This notice describes the current Maison Debrah Ethiopia website. For questions about information you share with the showroom, use the contact details below.</p>
      <section>
        <h2>Information you choose to share</h2>
        <p>When you contact the showroom on WhatsApp, you may provide your name, contact details, product choices and project requirements. Those details are used to respond to your request and discuss a possible quotation or service. The website does not offer a newsletter signup.</p>
        <p>Website forms open a draft in your email app, and WhatsApp links open an editable message. You choose whether to send either message. The website does not send or store form details on a server.</p>
      </section>
      <section>
        <h2>Information kept in your browser</h2>
        <p>The inquiry cart is stored locally in your browser so your selection remains available when you return. It is not an online order or customer account. Clearing this site's browser storage removes that saved selection.</p>
      </section>
      <section>
        <h2>Other services</h2>
        <p>The website loads fonts from Google Fonts. Choosing an email, WhatsApp, social media or brochure link opens another service that handles information under its own privacy terms. The website does not add its own analytics or advertising tracker.</p>
      </section>
      <section>
        <h2>Your choices and questions</h2>
        <p>You can ask the showroom about information sent to it, including access, correction or deletion requests where applicable. The website does not store inquiry forms on a server. Ask the showroom about its handling and retention of email and WhatsApp messages.</p>
      </section>
      <ContactLine />
    </div>
  )

  return (
    <div className="policy-content">
      <p>This website presents the Maison Debrah Ethiopia collection and offers ways to request product information. It does not take online payments or complete purchases.</p>
      <section>
        <h2>Products and inquiries</h2>
        <p>Images, descriptions and dimensions help you explore the collection. Materials and colours may appear different on a screen, and availability can change. Please confirm the exact product, finish, size and quantity with the showroom before making a decision.</p>
        <p>Adding a product to the inquiry cart saves a selection in your browser. It does not reserve stock, create an order or commit either party to a sale. Any order terms are confirmed separately with the showroom.</p>
      </section>
      <section>
        <h2>Quotation and fulfilment</h2>
        <p>The written agreement for an order should confirm the product specification, price, payment arrangements, expected timing, delivery service and any custom-order conditions. Please review it carefully and raise questions before accepting it. See <Link to="/shipping">delivery information</Link> and <Link to="/returns">custom orders and returns</Link> for the website's general guidance.</p>
      </section>
      <section>
        <h2>External links and site content</h2>
        <p>Links to WhatsApp, social media and the brochure lead to services outside this website. Their content and terms are controlled by their operators. Site text and images remain subject to the rights of their respective owners.</p>
      </section>
      <section>
        <h2>Questions</h2>
        <p>If something on the site differs from a written quotation or order confirmation, ask the showroom to clarify it before proceeding. Nothing on this page limits rights that cannot be excluded under applicable law.</p>
      </section>
      <ContactLine />
    </div>
  )
}
