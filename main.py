import discord
import os
from dotenv import load_dotenv
from discord.ext import commands
import logging

logging.basicConfig(level=logging.INFO)

load_dotenv()

intents = discord.Intents.default()
intents.members = True

bot = commands.Bot(command_prefix='-', intents=intents)


@bot.event
async def on_ready():
    logging.info('We have logged in as {0.user}'.format(bot))

'''
@bot.event
async def on_message(message):
    if message.author == client.user:
        return

    if message.content.startswith('$hello'):
        await message.channel.send('Hello ' + str(message.author) + "!")

    if message.content.startswith('!assignteam' or '!at'):
        pass
'''

@bot.command()
async def ping(ctx):
    '''Pong! Get the bot's response time'''
    em = discord.Embed(color=discord.Color.green())
    em.title = "Pong!"
    em.description = f'{bot.latency * 1000} ms'
    await ctx.send(embed=em)


"""MENTOR MANAGEMENT"""


@bot.group()
async def mentoradmin(ctx):
    """Command for managing users and their permissions"""
    if ctx.invoked_subcommand is None:
        await ctx.send('Wrong invocation of the mentor command, no sub-command passed!')


@mentoradmin.command(name='assign')
async def _assign_mentor(ctx):
    """Assign permissions to a mentor directly from the Discord Interface"""
    await ctx.send('Mentor was assigned permissions.')



"""USER MANAGEMENT"""


@bot.group()
async def user(ctx):
    """Command for managing users and their permissions"""
    if ctx.invoked_subcommand is None:
        await ctx.send('Wrong invocation of the user command, no sub-command passed!')


@user.command(name='assign')
async def _assign_team(ctx):
    """Add new team directly from the Discord Interface"""
    await ctx.send('User was assigned to team')



"""TEAM MANAGEMENT"""
@bot.group()
async def team(ctx):
    """Command for managing teams"""
    if ctx.invoked_subcommand is None:
        await ctx.send('Wrong invocation of the team command, no sub-command passed!')


@team.command(name='add')
async def _add_team(ctx):
    """Add new team directly from the Discord Interface"""

    #Team creation also creates a text and voice channel for the team, and subsequently assigns permissions ONLY to those team members and administrators

    await ctx.send('Team is being added')


@team.command(name='remove')
async def _remove_team(ctx):
    """Removes a team directly from the Discord Interface"""
    await ctx.send('Team is being removed')


"""MENTOR REQUEST"""


@bot.group()
async def mentor(ctx):
    """Command group for interacting with mentors"""
    if ctx.invoked_subcommand is None:
        await ctx.send('Wrong invocation of the mentor command, no sub-command passed!')

@mentor.command(name='request')
async def _request_mentor(ctx):
    """Request a mentor directly from the Discord Interface"""
    await ctx.send('Mentor was requested by team.')


@mentor.command(name='attend')
async def _attend_team(ctx):
    """Mentor accepts team request and moves to voice channel automatically"""

    #Channel is created exclusively for this session, mentor is moved automatically (needs to end session by command)
    #Team recieves a message with the channel and gets assigned permissions for such


    await ctx.send('Mentor accepted a team reuqest for mentoring.')

bot.run(os.getenv('TOKEN'))
