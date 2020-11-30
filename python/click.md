官网提供了通过runner.invoke()进行单元测试的方法，但是直接调用测试更简洁方便一点。
在main中直接调用click命令进行调试：
```python
from datetime import datetime
import click

@click.command()
@click.option('-n', type=click.INT, prompt=True)
@click.option('-bd', type=click.STRING, prompt=True, help='开始时间：1990-12-19')
@click.option('-ed', type=click.STRING, default=datetime.now().strftime("%Y-%m-%d"), help='结束时间,默认今天')
def create_task(n, bd, ed):
    click.echo('Hello %s!' % n)
    click.echo('Hello %s!' % bd)
    click.echo('Hello %s!' % ed)
    
def main():
    create_task(['-n', 1, '-bd', '1990-12-19'])

if __name__ == "__main__":
    main()

```

参数是一个列表，按照['参数'，值，……]依次排列。