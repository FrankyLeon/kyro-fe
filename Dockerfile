FROM wordpress:7.0.2-php8.4-apache

# Fix Apache MPM configuration
RUN a2dismod mpm_event || true && \
    a2dismod mpm_worker || true && \
    a2enmod mpm_prefork && \
    a2enmod rewrite

# Clone kyro-plugin from GitHub
RUN git clone https://github.com/FrankyLeon/kyro-plugin.git /var/www/html/wp-content/plugins/kyro-plugin

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html/wp-content/plugins/kyro-plugin

# Use the standard WordPress entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["apache2-foreground"]
