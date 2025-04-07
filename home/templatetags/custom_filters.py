from django import template

register = template.Library()

@register.filter
def mul(value, arg):
    """Multiplies the value by the argument."""
    try:
        return float(value) * float(arg)
    except (ValueError, TypeError):
        return ''
    
@register.filter(name='get_item')
def get_item(dictionary, key):
    return dictionary.get(key, '')
