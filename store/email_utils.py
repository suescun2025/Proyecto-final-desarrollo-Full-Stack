import os
import base64
import threading
import logging
from email.mime.image import MIMEImage
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.core.signing import Signer

logger = logging.getLogger(__name__)
signer = Signer()

def generate_ship_token(order_id):
    """
    Genera un token seguro de 1-clic firmado por Django para la confirmación de envío por e-mail.
    """
    return signer.sign(f"ship-order-{order_id}")

def verify_ship_token(order_id, token):
    """
    Valida si el token firmado corresponde al ID del pedido para envío.
    """
    try:
        unsigned = signer.unsign(token)
        return unsigned == f"ship-order-{order_id}"
    except Exception:
        return False

def generate_cancel_token(order_id):
    """
    Genera un token seguro firmado por Django para la cancelación de un pedido desde el e-mail.
    """
    return signer.sign(f"cancel-order-{order_id}")

def verify_cancel_token(order_id, token):
    """
    Valida si el token firmado corresponde al ID del pedido para cancelación.
    """
    try:
        unsigned = signer.unsign(token)
        return unsigned == f"cancel-order-{order_id}"
    except Exception:
        return False

def send_email_via_http_api(to_email, subject, html_body, text_body):
    """
    Envía un correo electrónico utilizando la API REST HTTP de Resend o Brevo (Puerto 443 HTTPS).
    Evita bloqueos de puertos SMTP y garantiza entrega instantánea en la Bandeja de Entrada Principal.
    """
    resend_api_key = getattr(settings, 'RESEND_API_KEY', '')
    if resend_api_key and str(resend_api_key).strip():
        try:
            import urllib.request
            import json
            url = 'https://api.resend.com/emails'
            headers = {
                'Authorization': f'Bearer {str(resend_api_key).strip()}',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
            from_email = 'TechMatch Store <onboarding@resend.dev>'

            payload = {
                'from': from_email,
                'to': [to_email],
                'subject': subject,
                'html': html_body,
                'text': text_body
            }

            req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers)
            with urllib.request.urlopen(req, timeout=10) as res:
                if res.status in (200, 201, 202):
                    logger.info(f"[HTTP Email API] Email sent to {to_email} via Resend HTTP API (Status {res.status})")
                    return True
        except Exception as e:
            logger.error(f"[HTTP Email API Error] Failed sending to {to_email} via Resend: {e}")

    # Fallback al backend de Django (SMTP)
    try:
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'suescunyeferson32@gmail.com')
        email_msg = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=from_email,
            to=[to_email]
        )
        email_msg.attach_alternative(html_body, "text/html")
        email_msg.send(fail_silently=False)
        logger.info(f"[SMTP Email] Email sent to {to_email} via SMTP fallback")
        return True
    except Exception as ex_smtp:
        logger.error(f"[SMTP Email Error] Failed to send email to {to_email}: {ex_smtp}")
        return False

def build_cid_attachments(items, order_id):
    """
    Construye las filas de productos en HTML, resumen en texto plano y lista de datos de imágenes inline.
    Devuelve (items_html_rows, summary_text, raw_attachments)
    """
    items_summary_txt = []
    items_html_rows = ""
    raw_attachments = []

    for idx, item in enumerate(items):
        p_name = item.product.name
        c_model = (item.custom_model or "").strip()
        device_keywords = ['macbook', 'iphone', 'samsung', 'ipad', 'galaxy', 'xiaomi', 'pixel']
        is_device_model = any(kw in c_model.lower() for kw in device_keywords)

        if c_model and not is_device_model and c_model != p_name:
            display_title = c_model
            model_info = ""
        elif is_device_model and ("Personalizada" in p_name or "Carcasa" in p_name):
            display_title = "Carcasa Personalizada"
            model_info = f"<br/><small style='color: #00f2fe;'>📱 Modelo: {c_model}</small>"
        elif c_model:
            display_title = p_name
            model_info = f"<br/><small style='color: #00f2fe;'>📱 Modelo: {c_model}</small>"
        else:
            display_title = p_name
            model_info = ""

        line = f"• {item.quantity}x {display_title} ({item.price:.2f} €)"
        if c_model and is_device_model:
            line += f" - Modelo: {c_model}"
        items_summary_txt.append(line)

        raw_src = ""
        if item.custom_image:
            raw_src = item.custom_image
        elif item.product and item.product.image:
            try:
                raw_src = item.product.image.url
            except Exception:
                raw_src = ""

        cid_src = None
        if raw_src and (raw_src.startswith('http://') or raw_src.startswith('https://')):
            if not ('127.0.0.1' in raw_src or 'localhost' in raw_src):
                cid_src = raw_src

        icon_emoji = "📦"
        p_name_lower = p_name.lower()
        c_model_lower = (c_model or "").lower()
        if c_model or "personalizada" in p_name_lower or "carcasa" in p_name_lower or "fundas" in p_name_lower:
            icon_emoji = "🎨"
        elif "macbook" in p_name_lower or "thinkpad" in p_name_lower or "laptop" in p_name_lower or "macbook" in c_model_lower:
            icon_emoji = "💻"
        elif "iphone" in p_name_lower or "samsung" in p_name_lower or "galaxy" in p_name_lower or "iphone" in c_model_lower or "samsung" in c_model_lower:
            icon_emoji = "📱"
        elif "cargador" in p_name_lower or "cable" in p_name_lower or "adaptador" in p_name_lower or "magsafe" in p_name_lower:
            icon_emoji = "🔌"

        if cid_src and len(cid_src) < 2000:
            img_td = f"""
            <td style="padding: 10px; width: 64px; text-align: center; vertical-align: middle;">
                <img src="{cid_src}" alt="{display_title}" style="width: 56px; height: 56px; object-fit: cover; border-radius: 8px; border: 1.5px solid #00f2fe; background: #0f172a; display: block; margin: 0 auto;" />
            </td>
            """
        else:
            img_td = f"""
            <td style="padding: 10px; width: 64px; text-align: center; vertical-align: middle;">
                <div style="width: 56px; height: 56px; border-radius: 8px; background: #0f172a; border: 1.5px solid #00f2fe; display: inline-block; line-height: 56px; text-align: center; font-size: 26px;">{icon_emoji}</div>
            </td>
            """

        items_html_rows += f"""
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
            {img_td}
            <td style="padding: 12px; color: #f8fafc; vertical-align: middle;">
                <strong style="font-size: 14px; color: #ffffff;">{display_title}</strong>{model_info}
            </td>
            <td style="padding: 12px; text-align: center; color: #cbd5e1; font-weight: bold; vertical-align: middle;">x{item.quantity}</td>
            <td style="padding: 12px; text-align: right; color: #00f2fe; font-weight: bold; font-size: 15px; vertical-align: middle;">{item.price:.2f} €</td>
        </tr>
        """

    return items_html_rows, "\n".join(items_summary_txt), raw_attachments

def send_order_notification_email_async(order, custom_recipient_email=None):
    """
    Envía una notificación por correo electrónico de un nuevo pedido en un hilo secundario asíncrono.
    Separa el correo enviado al Administrador (con botón de envío) del correo enviado al Cliente (con opción de cancelar).
    """
    def _send():
        try:
            order_id = order.id
            user_str = order.user.username if order.user else 'Cliente'
            created_date = order.created_at.strftime('%d/%m/%Y %H:%M:%S')
            total_val = f"{order.total:.2f}"
            shipping_addr = order.shipping_address if order.shipping_address else 'Dirección Estándar de Entrega'
            owner_email = getattr(settings, 'STORE_OWNER_EMAIL', 'suescunyeferson32@gmail.com')
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'suescunyeferson32@gmail.com')
            raw_user_email = custom_recipient_email or (order.user.email if (order.user and order.user.email) else None)
            user_email = raw_user_email if (raw_user_email and '@' in raw_user_email) else owner_email

            ship_token = generate_ship_token(order_id)
            cancel_token = generate_cancel_token(order_id)

            ship_action_url = f"http://127.0.0.1:8000/api/orders/{order_id}/ship-email-action/?token={ship_token}"
            cancel_action_url = f"http://127.0.0.1:8000/api/orders/{order_id}/cancel-email-action/?token={cancel_token}"

            items = list(order.items.all())
            items_html_rows, summary_text, raw_attachments = build_cid_attachments(items, order_id)

            def attach_cids_to_email(email_msg):
                for img_bytes, cid_id, filename in raw_attachments:
                    try:
                        mime_img = MIMEImage(img_bytes)
                        mime_img.add_header('Content-ID', f'<{cid_id}>')
                        mime_img.add_header('Content-Disposition', 'inline', filename=filename)
                        email_msg.attach(mime_img)
                    except Exception as e:
                        logger.error(f"Error adjuntando imagen CID {cid_id}: {e}")

            # Determinar si el pedido fue realizado por un usuario de staff/administrador
            is_staff_user = order.user.is_staff if order.user else False

            # =========================================================
            # 1. ENVIAR CORREO AL ADMINISTRADOR DE LA TIENDA (Solo para staff o email de tienda independiente)
            # =========================================================
            if owner_email and (is_staff_user or owner_email != user_email):
                admin_subject = f"⚡ [ADMIN] ¡Nuevo Pedido Recibido #{order_id}! - TechMatch"
                admin_text_body = f"""
==================================================
        NUEVO PEDIDO RECIBIDO - TECHMATCH (ADMIN)
==================================================

¡Hola Administrador! Se ha registrado un nuevo pedido en la tienda TechMatch.

DETALLES DEL PEDIDO:
--------------------------------------------------
- ID de Pedido: #{order_id}
- Cliente: {user_str} ({user_email if user_email else 'Sin correo registrado'})
- Fecha: {created_date}
- Total: {total_val} €
- Dirección de Envío: {shipping_addr}

PRODUCTOS DEL PEDIDO:
{summary_text}

ACCIÓN DE ADMINISTRADOR (CONFIRMACIÓN DE ENVÍO):
Haga clic en el siguiente enlace para marcar este pedido como ENVIADO:
{ship_action_url}

==================================================
TechMatch Store • Panel de Gestión
==================================================
"""
                admin_html_body = f"""
                <!DOCTYPE html>
                <html>
                <head><meta charset="utf-8"></head>
                <body style="background-color: #0b0f19; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 24px;">
                    <div style="max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid rgba(0, 242, 254, 0.2); box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
                        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 28px; text-align: center; border-bottom: 2px solid #00f2fe;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">⚡ TechMatch Admin</h1>
                            <p style="color: #00f2fe; margin: 6px 0 0 0; font-size: 14px; font-weight: bold;">📦 NUEVO PEDIDO REGISTRADO #{order_id}</p>
                        </div>

                        <div style="padding: 24px; color: #e2e8f0;">
                            <p style="font-size: 15px; margin-top: 0;">Se ha registrado un nuevo pedido en el sistema. Detalles del comprador:</p>
                            
                            <div style="background: #0f172a; padding: 16px; border-radius: 10px; margin: 18px 0; border-left: 4px solid #00f2fe;">
                                <p style="margin: 4px 0; font-size: 14px;">👤 <strong>Cliente:</strong> {user_str}</p>
                                <p style="margin: 4px 0; font-size: 14px;">✉️ <strong>Email:</strong> {user_email or 'No proporcionado'}</p>
                                <p style="margin: 4px 0; font-size: 14px;">📅 <strong>Fecha y Hora:</strong> {created_date}</p>
                                <p style="margin: 4px 0; font-size: 14px;">📍 <strong>Dirección de Entrega:</strong> {shipping_addr}</p>
                            </div>

                            <h3 style="color: #f8fafc; font-size: 16px; margin-bottom: 10px;">📦 Productos Solicitados:</h3>
                            <table style="width: 100%; border-collapse: collapse; background: #0f172a; border-radius: 8px; overflow: hidden; margin-bottom: 16px;">
                                <thead>
                                    <tr style="background: #334155; color: #94a3b8; font-size: 12px; text-align: left;">
                                        <th style="padding: 10px; width: 64px; text-align: center;">FOTO</th>
                                        <th style="padding: 10px 12px;">PRODUCTO</th>
                                        <th style="padding: 10px 12px; text-align: center;">CANT.</th>
                                        <th style="padding: 10px 12px; text-align: right;">PRECIO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items_html_rows}
                                </tbody>
                            </table>

                            <div style="text-align: right; background: #0f172a; padding: 14px 18px; border-radius: 8px;">
                                <span style="color: #94a3b8; font-size: 14px; margin-right: 12px;">Total Pagado:</span>
                                <span style="color: #00f2fe; font-size: 22px; font-weight: bold;">{total_val} €</span>
                            </div>

                            <!-- Botón interactivo exclusivo para el Administrador -->
                            <div style="margin-top: 24px; text-align: center; background: #0f172a; padding: 22px; border-radius: 12px; border: 1px dashed #00f2fe;">
                                <p style="color: #00f2fe; font-size: 13px; font-weight: bold; margin: 0 0 12px 0;">⚡ ACCIÓN DE ADMINISTRADOR:</p>
                                <a href="{ship_action_url}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); color: #0b0f19; font-weight: 800; font-size: 15px; padding: 14px 28px; border-radius: 30px; text-decoration: none; box-shadow: 0 4px 15px rgba(0, 242, 254, 0.4);">
                                    🚚 Marcar Pedido #{order_id} como ENVIADO (1 Clic)
                                </a>
                            </div>
                        </div>

                        <div style="background: #0f172a; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.05);">
                            TechMatch Store • Panel Interno de Gestión de Pedidos
                        </div>
                    </div>
                </body>
                </html>
                """

                send_email_via_http_api(owner_email, admin_subject, admin_html_body, admin_text_body)

            # =========================================================
            # 2. ENVIAR CORREO AL CLIENTE (SIN BOTÓN DE ADMIN, CON BOTÓN CANCELAR)
            # =========================================================
            if user_email and '@' in user_email:
                cust_subject = f"📦 ¡Gracias por tu compra! Confirmación de Pedido #{order_id} - TechMatch"
                cust_text_body = f"""
==================================================
     ¡GRACIAS POR TU COMPRA EN TECHMATCH!
==================================================

Hola {user_str},

Hemos recibido tu pedido correctamente y ya lo estamos preparando.

RESUMEN DE TU PEDIDO:
--------------------------------------------------
- Pedido N°: #{order_id}
- Fecha: {created_date}
- Total: {total_val} €
- Dirección de Envío: {shipping_addr}

PRODUCTOS:
{summary_text}

CANCELACIÓN DE PEDIDO:
Si deseas cancelar tu pedido o cometiste un error, puedes cancelarlo e indicar el motivo accediendo aquí:
{cancel_action_url}

==================================================
TechMatch Store • Gracias por tu confianza
==================================================
"""
                cust_html_body = f"""
                <!DOCTYPE html>
                <html>
                <head><meta charset="utf-8"></head>
                <body style="background-color: #0b0f19; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 24px;">
                    <div style="max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid rgba(0, 242, 254, 0.2); box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
                        
                        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 28px; text-align: center; border-bottom: 2px solid #00f2fe;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">⚡ TechMatch</h1>
                            <p style="color: #00f2fe; margin: 6px 0 0 0; font-size: 14px; font-weight: bold;">🎉 ¡GRACIAS POR TU COMPRA! PEDIDO #{order_id}</p>
                        </div>

                        <div style="padding: 24px; color: #e2e8f0;">
                            <p style="font-size: 15px; margin-top: 0;">¡Hola <strong>{user_str}</strong>! Hemos recibido tu pedido con éxito y el equipo de TechMatch se encuentra preparándolo para su envío.</p>
                            
                            <div style="background: #0f172a; padding: 16px; border-radius: 10px; margin: 18px 0; border-left: 4px solid #00f2fe;">
                                <p style="margin: 4px 0; font-size: 14px;">👤 <strong>Cliente:</strong> {user_str}</p>
                                <p style="margin: 4px 0; font-size: 14px;">📅 <strong>Fecha del Pedido:</strong> {created_date}</p>
                                <p style="margin: 4px 0; font-size: 14px;">📍 <strong>Dirección de Entrega:</strong> {shipping_addr}</p>
                            </div>

                            <h3 style="color: #f8fafc; font-size: 16px; margin-bottom: 10px;">📦 Detalle de tu Pedido:</h3>
                            <table style="width: 100%; border-collapse: collapse; background: #0f172a; border-radius: 8px; overflow: hidden; margin-bottom: 16px;">
                                <thead>
                                    <tr style="background: #334155; color: #94a3b8; font-size: 12px; text-align: left;">
                                        <th style="padding: 10px; width: 64px; text-align: center;">FOTO</th>
                                        <th style="padding: 10px 12px;">PRODUCTO</th>
                                        <th style="padding: 10px 12px; text-align: center;">CANT.</th>
                                        <th style="padding: 10px 12px; text-align: right;">PRECIO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items_html_rows}
                                </tbody>
                            </table>

                            <div style="text-align: right; background: #0f172a; padding: 14px 18px; border-radius: 8px;">
                                <span style="color: #94a3b8; font-size: 14px; margin-right: 12px;">Total Pagado:</span>
                                <span style="color: #00f2fe; font-size: 22px; font-weight: bold;">{total_val} €</span>
                            </div>

                            <!-- Botón exclusivo para el cliente: CANCELAR PEDIDO -->
                            <div style="margin-top: 24px; text-align: center; background: #0f172a; padding: 22px; border-radius: 12px; border: 1px dashed rgba(239, 68, 68, 0.4);">
                                <p style="color: #f87171; font-size: 13px; font-weight: bold; margin: 0 0 6px 0;">❌ ¿Deseas cancelar este pedido?</p>
                                <p style="color: #94a3b8; font-size: 12px; margin: 0 0 14px 0;">Puedes solicitar la cancelación e indicar el motivo haciendo clic en el siguiente botón:</p>
                                <a href="{cancel_action_url}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; font-weight: 800; font-size: 14px; padding: 12px 26px; border-radius: 30px; text-decoration: none; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);">
                                    ❌ Cancelar mi Pedido #{order_id}
                                </a>
                            </div>

                        </div>

                        <div style="background: #0f172a; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.05);">
                            TechMatch Store • Gracias por elegirnos
                        </div>

                    </div>
                </body>
                </html>
                """

                send_email_via_http_api(user_email, cust_subject, cust_html_body, cust_text_body)

        except Exception as e:
            logger.error(f"[Email Notification Error] Failed to send order #{order.id} email: {e}")

    # Ejecutar envío directamente de forma sincrónica garantizada
    _send()

def send_order_shipped_email_async(order):
    """
    Envía una notificación por correo al cliente cuando su pedido ha sido marcado como ENVIADO.
    """
    def _send():
        try:
            order_id = order.id
            user_str = order.user.username if order.user else 'Cliente'
            user_email = order.user.email if (order.user and order.user.email) else None
            
            if not user_email:
                return

            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'suescunyeferson32@gmail.com')
            subject = f"📦 ¡Tu Pedido TechMatch #{order_id} ha sido ENVIADO!"
            
            text_body = f"""
==================================================
¡TU PEDIDO HA SIDO ENVIADO! - TECHMATCH
==================================================

Hola {user_str},

¡Buenas noticias! Tu pedido #{order_id} ha sido procesado por el equipo de TechMatch y ya se encuentra en camino.

Puedes revisar el estado en tiempo real en la sección "Mis Pedidos" de nuestra web.

¡Gracias por confiar en TechMatch!
"""

            html_body = f"""
            <!DOCTYPE html>
            <html>
            <body style="background-color: #0b0f19; font-family: sans-serif; margin: 0; padding: 24px; color: #ffffff;">
                <div style="max-width: 550px; margin: 0 auto; background: #1e293b; border-radius: 14px; padding: 24px; border: 1px solid #00f2fe; text-align: center;">
                    <h2 style="color: #00f2fe; margin-top: 0;">🚚 ¡Tu Pedido #{order_id} ha sido ENVIADO!</h2>
                    <p style="color: #cbd5e1; font-size: 15px;">Hola <strong>{user_str}</strong>, tu paquete ha salido de nuestras instalaciones y ya está en camino a tu dirección.</p>
                    <div style="margin: 24px 0; background: #0f172a; padding: 16px; border-radius: 8px;">
                        <span style="color: #00f2fe; font-weight: bold; font-size: 16px;">Estado Actual: ENVIADO / EN CAMINO</span>
                    </div>
                    <p style="color: #94a3b8; font-size: 13px;">Puedes consultar tu pedido en cualquier momento accediendo a la sección <strong>"Mis Pedidos"</strong> en TechMatch.</p>
                </div>
            </body>
            </html>
            """

            send_email_via_http_api(user_email, subject, html_body, text_body)
        except Exception as e:
            logger.error(f"[Order Shipped Email Error] Failed for order #{order.id}: {e}")

    _send()
