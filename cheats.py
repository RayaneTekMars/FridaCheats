"""
This script is a cheats console for Heroes of Might and Magic III.
It uses Frida to hook the game and modify the memory.

Usage:
    python cheats.py [game_path] # game_path is optional, if not specified, the script will try to attach to "HEROES3.EXE"

Commands:
    player: Display player informations
    player_loop: Display player informations every 100ms
    set <variable> <value>: Set the value of a variable
    clear: Clear the console
    exit: Exit the program

Available variables for "set":
    Resources:
        - wood
        - mercury
        - ore
        - sulfur
        - crystal
        - gem
        - gold
    Hero:
        - xp
        - level
        - movelimit
"""

import subprocess
import frida
import time
import cmd
import sys
import os

class Cheats(cmd.Cmd):
    intro = 'Welcome to the cheats console for Heroes of Might and Magic III.\nType help or ? to list commands.\n'
    prompt = '(HMM3 Cheat Console) > '
    file = None

    def do_player(self, arg):
        """Display player informations"""
        player_str = script.exports_sync.printplayer()
        if player_str is None:
            return
        print(player_str)

    def do_player_loop(self, arg):
        """Display player informations every 100ms"""
        while True:
            try:
                player_str: str = script.exports_sync.printplayer()
                if player_str is None:
                    break
                lines = os.get_terminal_size().lines
                player_str += '\n' * (lines - player_str.count('\n') - 1)
                print(player_str, end='\r')
                time.sleep(0.1)
            except KeyboardInterrupt:
                self.do_clear(None)
                break

    def do_set(self, arg):
        """Set the value of a variable (set <variable> <value>)

Available variables:
    Resources:
        - wood
        - mercury
        - ore
        - sulfur
        - crystal
        - gem
        - gold
    Hero:
        - xp
        - level
        - movelimit
        """
        args = arg.split(' ')
        if len(args) < 2:
            print('Missing arguments')
            return
        elif len(args) > 2:
            print('Too many arguments for set')
            return
        try:
            value = int(args[1])
            script.exports_sync.setplayer(str(args[0]).lower(), value)
        except ValueError:
            print('Invalid value')
            return

    def do_clear(self, arg):
        """Clear the console"""
        subprocess.run(["powershell", "Clear-Host"], shell=True)

    def do_exit(self, arg):
        """Exit the program"""
        session.detach()
        sys.exit(0)

    def default(self, arg):
        print('Unknown command')
        print('Type "help" or ? to list commands.')


def on_message(message, data):
    print(message)

try:
    session = frida.attach(sys.argv[1] if len(sys.argv) > 1 else "HEROES3.EXE")

    with open('cheats.js', 'r') as f:
        jscode = f.read()
    script = session.create_script(jscode)
    script.on('message', on_message)
    script.load()

    cheats = Cheats()
    cheats.cmdloop()

except KeyboardInterrupt:
    session.detach()
    sys.exit(0)
except Exception as e:
    print("Game not found or not running.")
    sys.exit(1)
